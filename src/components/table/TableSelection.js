export class TableSelection {
  static selectedClass = 'spreedsheet__table__row__data-cell--selected'

  constructor() {
    this._group = []
    /** @type {null|Dom}*/
    this.current = null
  }

  /**
   *
   * @param {Dom} $el
   */
  select($el) {
    this.clear()
    $el.focus().addClass(TableSelection.selectedClass)
    this._group.push($el)
    this.current = $el
  }

  clear() {
    this._group.forEach($el => $el.removeClass(TableSelection.selectedClass))
    this._group = []
  }

  get selectedIds() {
    return this._group.map($el => $el.getDataId())
  }

  selectGroup($group = []) {
    this.clear()
    this._group = $group
    this._group.forEach($el => $el.addClass(TableSelection.selectedClass))
  }

  applyStyle(style) {
    this._group.forEach($el => $el.css(style))
  }
}