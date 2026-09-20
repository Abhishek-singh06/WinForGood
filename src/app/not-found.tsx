import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-32 bg-bg-deep text-center">
      <Container size="narrow">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-12 h-12 rounded bg-surface-charcoal border border-border-silver flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-serif font-medium text-white">Page Not Found</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            The page you requested does not exist or has been moved.
          </p>
          <div>
            <Link href="/">
              <Button variant="silver" size="sm">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
