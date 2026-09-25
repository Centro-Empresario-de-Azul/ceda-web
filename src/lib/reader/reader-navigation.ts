export interface PageNavigator {
  canGoPrev(): boolean;
  canGoNext(): boolean;
  prevPage(): void;
  nextPage(): void;
  onPageChange(listener: (page: number) => void): void;
}

// The zoom dialog lives inside root, so its keystrokes bubble here too.
function ignoresArrowKeys(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.closest('input, textarea, select, dialog') !== null;
}

// aria-disabled rather than `disabled`: a disabled button drops focus to <body>, which
// would strand a keyboard user who just paged to the end with that very button.
function setDisabled(button: HTMLElement, disabled: boolean): void {
  button.setAttribute('aria-disabled', String(disabled));
}

export function bindReaderNavigation(
  root: HTMLElement,
  prevButton: HTMLElement,
  nextButton: HTMLElement,
  reader: PageNavigator,
): void {
  const refresh = (): void => {
    setDisabled(prevButton, !reader.canGoPrev());
    setDisabled(nextButton, !reader.canGoNext());
  };

  prevButton.addEventListener('click', () => reader.prevPage());
  nextButton.addEventListener('click', () => reader.nextPage());
  reader.onPageChange(refresh);
  refresh();

  root.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (ignoresArrowKeys(event.target)) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      reader.prevPage();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      reader.nextPage();
    }
  });
}
