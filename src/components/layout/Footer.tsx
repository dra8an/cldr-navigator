export default function Footer() {
  return (
    <footer className="border-t bg-card py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <p>
              Built with{' '}
              <a
                href="https://cldr.unicode.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                CLDR v48.0.0
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://cldr.unicode.org/index/cldr-spec"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              CLDR Documentation
            </a>
            <a
              href="https://github.com/unicode-org/cldr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
