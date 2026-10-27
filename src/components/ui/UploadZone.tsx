import { useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { Avatar } from './Avatar';

interface UploadZoneProps {
  initials: string;
  imageUrl: string | null;
  onFile: (file: File | null) => void;
}

/**
 * Measured from .mpuza-create-company-logo-dragger / -drop / -preview:
 *   border 1px dashed #cbd5e1, background #f8fafc, radius .375rem,
 *   a 72px preview circle (#e5e7eb, 3px white ring, 0 4px 12px rgba(15,23,42,.12)),
 *   the copy "Drag & drop or click to upload" with the helper line beneath,
 *   and a blue upload glyph (sampled #35a8df from create-empty.png).
 */
export const UploadZone = ({ initials, imageUrl, onFile }: UploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFile(e.dataTransfer.files?.[0] ?? null);
      }}
      className={cx(
        'rounded-md border border-dashed bg-surface-subtle p-3',
        'transition-colors duration-base ease-default',
        dragging ? 'border-primary bg-surface-tint' : 'border-line-dashed',
      )}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-4 rounded-md text-left"
      >
        <Avatar initials={initials} src={imageUrl} size="md" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex items-center gap-2">
            <UploadGlyph />
            <span className="text-meta font-bold text-text">Drag &amp; drop or click to upload</span>
          </span>
          <span className="text-bar-sub text-text-muted">
            PNG or JPG. If you skip this, initials ({initials}) will be used.
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        aria-label="Upload company logo"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

const UploadGlyph = () => (
  <svg
    className="h-5 w-5 shrink-0 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 17v1.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
