/**
 * Vercel Serverless Function: /api/bmkg?adm4=<kode>
 *
 * Fungsi ini adalah FALLBACK jika request langsung dari browser ke
 * api.bmkg.go.id terblokir (CORS/jaringan). Saat ini BMKG sudah mengirim
 * header `access-control-allow-origin: *`, sehingga aplikasi memakai direct
 * request terlebih dahulu; proxy ini hanya dipakai bila direct gagal.
 */

const UPSTREAM = 'https://api.bmkg.go.id/publik/prakiraan-cuaca';

/** Kode wilayah BMKG level desa/kelurahan, contoh: 35.26.01.1001 */
const ADM4_PATTERN = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/;

interface RequestLike {
  query: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  status(code: number): ResponseLike;
  setHeader(name: string, value: string): ResponseLike;
  send(body: string): void;
}

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: RequestLike, res: ResponseLike): Promise<void> {
  const adm4 = firstQueryValue(req.query.adm4);

  if (!adm4 || !ADM4_PATTERN.test(adm4)) {
    res
      .status(400)
      .setHeader('Content-Type', 'application/json; charset=utf-8')
      .send(JSON.stringify({ error: 'Parameter adm4 wajib diisi dengan kode wilayah yang valid.' }));
    return;
  }

  try {
    const upstream = await fetch(`${UPSTREAM}?adm4=${encodeURIComponent(adm4)}`, {
      headers: {
        Accept: 'application/json',
        // BMKG menolak request tanpa User-Agent yang dikenal.
        'User-Agent':
          'Mozilla/5.0 (compatible; PantauBKL/1.0; +https://vercel.com) AppleWebKit/537.36 Chrome/126 Safari/537.36',
      },
      signal: AbortSignal.timeout(15_000),
    });

    const body = await upstream.text();
    res
      .status(upstream.status)
      .setHeader('Content-Type', 'application/json; charset=utf-8')
      .setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
      .send(body);
  } catch {
    res
      .status(502)
      .setHeader('Content-Type', 'application/json; charset=utf-8')
      .send(JSON.stringify({ error: 'Gagal menghubungi layanan BMKG.' }));
  }
}
