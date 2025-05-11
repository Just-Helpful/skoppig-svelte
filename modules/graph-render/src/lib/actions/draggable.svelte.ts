import { add_drag } from "$lib/utils/drag.js";
import type { Action } from "svelte/action";

export type MoveEvent = CustomEvent<{
  /** The [x, y] position that the element was moved to */
  pos: [number, number];
  /** The element that was moved */
  elem: HTMLElement;
  /** Optional data attached to the dragged element */
  data?: any;
}>;

/** Parameters for the `draggable` action */
export type DraggableParams = {
  /** Data attached to the draggable element\
   * This data will be passed to the `onmove` handler
   */
  data?: any;
};

/** Event handlers for `draggable` elements */
export type DraggableHandlers = {
  /** A handler called whenever this element is moved.
   *
   * @param e event data for the moved element
   */
  onmove(e: MoveEvent): void;
};

/** Makes a given element draggable within its parent.
 * @param elem the element to apply the action to
 * @param params the parameters the action takes {@link DraggableParams}
 */
export const draggable: Action<
  HTMLElement,
  DraggableParams | undefined,
  DraggableHandlers
> = (elem, { data } = {}) => {
  $effect(() => {
    make_movable(elem);
    let dx: number;
    let dy: number;

    /** find initial offset of the mouse from the element */
    const onstart = ({ clientX: mx, clientY: my }: MouseEvent) => {
      const { x, y } = elem.getBoundingClientRect();
      dx = x - mx;
      dy = y - my;
    };

    /** update the position of the element from the mouse */
    const onmove = ({ clientX: x, clientY: y }: MouseEvent) => {
      elem.style.left = `${x + dx}px`;
      elem.style.top = `${y + dy}px`;

      const evt = new CustomEvent("move", {
        detail: { pos: [x, y], elem, data },
      });
      elem.dispatchEvent(evt);
    };

    return add_drag(elem, { onstart, onmove, onend: onmove });
  });
};

/** Positions an element as `"absolute"`, whilst maintaining its dimensions.
 * @param elem **[mut]** the element to position
 */
function make_movable(elem: HTMLElement) {
  const { x, y, width, height } = elem.getBoundingClientRect();
  elem.style.position = "absolute";
  elem.style.width = `${width}px`;
  elem.style.height = `${height}px`;

  // remove anything that might impact positioning
  elem.style.bottom = null as unknown as string;
  elem.style.right = null as unknown as string;

  // set the positioning from the rect
  elem.style.left = `${x}px`;
  elem.style.top = `${y}px`;
}
