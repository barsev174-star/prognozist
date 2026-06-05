type TeamLogoProps = {
  logo: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClassNames = {
  sm: "h-7 w-7 text-base",
  md: "h-9 w-9 text-xl",
  lg: "h-12 w-12 text-2xl",
};

export function TeamLogo({ logo, name, size = "md" }: TeamLogoProps) {
  const className = `${sizeClassNames[size]} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface ring-1 ring-black/5`;

  if (!logo) {
    return <span className={className}>{name.slice(0, 1).toUpperCase()}</span>;
  }

  if (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/")) {
    return <img src={logo} alt={name} className={`${className} object-cover`} />;
  }

  return (
    <span aria-label={name} className={className}>
      {logo}
    </span>
  );
}
