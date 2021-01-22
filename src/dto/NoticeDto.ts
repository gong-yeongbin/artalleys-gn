import { title } from "process";
import { NoticeData } from "../types/dataType";

export class NoticeBuilder {
  private _data: NoticeData[];
  private _offset: number;
  private _limit: number;
  private _order: string;
  private _filter: string;
  private _totalCount: number;

  constructor(
    notice: NoticeData[],
    offset: number,
    limit: number,
    order: string,
    filter: string,
    totalCount: number
  ) {
    this._data = notice.map((value, index) => {
      return {
        id: value.id,
        title: value.title,
        category: value.category,
        pushNotification: value.pushNotification,
        publish: value.publish,
        content: value.content,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
      };
    });
    this._offset = offset;
    this._limit = limit;
    this._order = order;
    this._filter = filter;
    this._totalCount = totalCount;
  }
  public replaceHost(newHost: string) {}

  public build() {
    return {
      data: this._data,
      _meta: {
        offset: this._offset,
        limit: this._limit,
        order: this._order,
        filter: this._filter,
        length: this._data.length,
        totalCount: this._totalCount,
      },
    };
  }
}
