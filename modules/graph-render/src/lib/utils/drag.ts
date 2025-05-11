export type DragHandlers = {
  /** Handler for starting dragging from `elem` */
  onstart(e: MouseEvent): void;
  /** Handler for moving in a dragged state */
  onmove(e: MouseEvent): void;
  /** Handler when drag ends (i.e. `mouseup`) */
  onend(e: MouseEvent): void;
};

/** Adds drag event listeners to a given element
 * @param elem the element to attach listeners to
 * @param handlers the event handlers to attach for drag events
 * @returns a cleanup function that remove handlers
 */
export function add_drag(
  elem: HTMLElement,
  { onstart, onmove, onend }: DragHandlers
): () => void {
  const drag_start = (e: MouseEvent) => {
    // console.log("Cancellable start =", e.cancelable);
    e.stopPropagation();
    e.preventDefault();
    onstart(e);
    window.addEventListener("mousemove", drag_move);
    window.addEventListener("mouseup", drag_end);
  };

  const drag_move = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onmove(e);
  };

  const drag_end = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window.removeEventListener("mousemove", drag_move);
    window.removeEventListener("mouseup", drag_end);
    onend(e);
  };

  elem.addEventListener("mousedown", drag_start);
  return () => {
    elem.removeEventListener("mousedown", drag_start);
    window.removeEventListener("mousemove", drag_move);
    window.removeEventListener("mouseup", drag_end);
  };
}
