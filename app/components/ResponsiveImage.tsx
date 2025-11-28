import Image from 'next/image';
import clsx from 'clsx';

const RAW_BLUR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" preserveAspectRatio="none"><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d4a373" offset="0%"/><stop stop-color="#6f865d" offset="100%"/></linearGradient><rect width="32" height="32" fill="url(#g)"/></svg>';
const DEFAULT_BLUR = `data:image/svg+xml,${encodeURIComponent(RAW_BLUR_SVG)}`;
const DEFAULT_VARIANT_WIDTHS = [480, 768, 1024, 1440];

function deriveVariantSources(src: string, widths: number[]) {
  try {
    const url = new URL(src);
    const isS3 = /amazonaws\.com$/i.test(url.hostname) || url.hostname.includes('.s3.');
    if (!isS3) return null;
    const extensionMatch = url.pathname.match(/(\.[a-zA-Z0-9]+)$/);
    const extension = extensionMatch ? extensionMatch[1] : '';
    const basePath = extension ? url.pathname.slice(0, -extension.length) : url.pathname;
    return widths.map((width) => ({
      width,
      url: `${url.origin}${basePath}_${width}.webp`
    }));
  } catch {
    return null;
  }
}

type VariantSource = { width: number; url: string; format?: string | null };

interface ResponsiveImageProps {
  src?: string | null;
  alt?: string;
  aspectRatio?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  placeholderText?: string;
  blurDataURL?: string;
  variantWidths?: number[];
  variants?: VariantSource[];
}

function guessMimeType(format?: string | null) {
  if (!format) return 'image/webp';
  const clean = format.replace('.', '').toLowerCase();
  if (clean === 'jpg' || clean === 'jpeg') return 'image/jpeg';
  if (clean === 'png') return 'image/png';
  if (clean === 'gif') return 'image/gif';
  if (clean === 'avif') return 'image/avif';
  return `image/${clean}`;
}

function normalizeVariants(variants?: VariantSource[]) {
  if (!Array.isArray(variants)) return [] as VariantSource[];
  return variants
    .filter((variant): variant is VariantSource => Boolean(variant?.url) && typeof variant?.width === 'number')
    .sort((a, b) => a.width - b.width);
}

export function ResponsiveImage({
  src,
  alt = '',
  aspectRatio,
  sizes = '100vw',
  priority = false,
  className,
  imageClassName,
  placeholderText = 'Afbeelding volgt',
  blurDataURL = DEFAULT_BLUR,
  variantWidths = DEFAULT_VARIANT_WIDTHS,
  variants
}: ResponsiveImageProps) {
  const ratio = aspectRatio && aspectRatio > 0 ? aspectRatio : 16 / 9;
  const explicitVariants = normalizeVariants(variants);
  const fallbackVariantSrc = !src && explicitVariants.length ? explicitVariants[explicitVariants.length - 1].url : null;
  const pictureSourceSet = explicitVariants.length
    ? explicitVariants.map((variant) => `${variant.url} ${variant.width}w`).join(', ')
    : src
    ? (deriveVariantSources(src, variantWidths) || []).map((source) => `${source.url} ${source.width}w`).join(', ')
    : '';
  const pictureType = explicitVariants.length
    ? guessMimeType(explicitVariants[explicitVariants.length - 1].format || explicitVariants[0].format)
    : 'image/webp';
  const shouldUsePicture = Boolean(pictureSourceSet);
  const effectiveSrc = src || fallbackVariantSrc || undefined;

  const img = effectiveSrc ? (
    <Image
      fill
      src={effectiveSrc}
      alt={alt}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={blurDataURL}
      priority={priority}
      className={clsx('absolute inset-0 h-full w-full object-cover', imageClassName)}
    />
  ) : null;

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden rounded-md bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900',
        className
      )}
      style={{ aspectRatio: `${ratio}` }}
    >
      {img ? (
        shouldUsePicture ? (
          <picture className="absolute inset-0 block">
            <source type={pictureType} srcSet={pictureSourceSet} sizes={sizes} />
            {img}
          </picture>
        ) : (
          img
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          {placeholderText}
        </div>
      )}
    </div>
  );
}
