import { StarIcon } from "@solar-icons/react/bold";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
};

type AuthLayoutProps = {
  brandName: string;
  title: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthLayout({
  brandName,
  title,
  subtitle,
  testimonials = [],
  footer,
  children,
}: AuthLayoutProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length < 2) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(id);
  }, [testimonials.length]);

  const current = testimonials[index];

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-background">
      {/* Columna izquierda */}
      <div className="hidden lg:flex flex-col items-center border-r border-border bg-muted/30 p-10 xl:p-14">
        <span className="text-center text-lg font-semibold text-foreground font-display">
          {brandName}
        </span>

        {current ? (
          <div className="flex flex-1 w-full items-center justify-center">
            <div className="w-full max-w-md text-center">
              <div
                className="flex justify-center gap-0.5 mb-4 text-primary"
                aria-hidden="true"
              >
                {["1", "2", "3", "4", "5"].map((star) => (
                  <StarIcon key={star} />
                ))}
              </div>

              <p className="text-xl font-medium text-foreground text-pretty leading-relaxed">
                "{current.quote}"
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    {current.author}
                  </p>

                  {current.role && (
                    <p className="text-xs text-muted-foreground">
                      {current.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brandName}. Todos los derechos
          reservados.
        </p>
      </div>

      {/* Columna derecha */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <span className="lg:hidden block text-lg font-semibold text-foreground mb-8 font-display">
            {brandName}
          </span>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground text-balance">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
            )}
          </div>

          {children}

          {footer && (
            <p className="text-center text-sm text-muted-foreground mt-6 text-pretty">
              {footer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
