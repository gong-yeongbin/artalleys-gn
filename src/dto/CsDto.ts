import { CsData } from "../types/dataType";
import { Cs } from "../entity/Entity";

export class CsBuilder {
  private _data: CsData[];
  private _totalCount: number;
  private _offset: number;
  private _limit: number;
  private _order: string;

  constructor(
    cs: Cs[],
    offset: number,
    limit: number,
    order: string,
    totalCount: number
  ) {
    this._data = cs.map((value, index) => {
      return {
        id: value.id,
        title: value.title,
        category: value.category,
        content: value.content,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
      };
    });
    this._offset = offset;
    this._limit = limit;
    this._order = order;
    this._totalCount = totalCount;
  }

  public build() {
    return {
      data: this._data,
      _meta: {
        offset: this._offset,
        limit: this._limit,
        order: this._order,
        length: this._data.length,
        totalCount: this._totalCount,
      },
    };
  }
}
