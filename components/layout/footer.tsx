import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <a
            href="mailto:wsx4588588@gmail.com"
            className="hover:text-foreground transition-colors"
          >
            wsx4588588@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}

