export default function createColumn({content, index, width}) {
  return `
    <div class="spreedsheet__table__row__data-column"
     data-type="resizable"
      data-col="${index}"
      style="width: ${width}"
      >
        ${content}
        <div class="spreedsheet__table__row__data-column--resize" data-resize="col"></div>
    </div>
  `
}