export default function BizCoreIcon({ className = 'h-9 w-9' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        className="fill-white"
      />
      <path
        d="M22 14h12.5c8 0 12.5 3.8 12.5 10 0 4-2.1 6.9-5.8 8.3C45 33.9 47.5 37.1 47.5 42c0 6.8-5.2 10.5-14 10.5H22V14Zm8.5 7v8h3.6c3.4 0 5.2-1.4 5.2-4s-1.8-4-5.2-4h-3.6Zm0 14v9.5h4.3c4.1 0 6.2-1.8 6.2-4.8s-2.1-4.7-6.2-4.7h-4.3Z"
        fillRule="evenodd"
        className="fill-black"
      />
    </svg>
  )
}
