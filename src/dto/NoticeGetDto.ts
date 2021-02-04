import { NoticeData } from "../types/dataType";

export class NoticeGetBuilder {
  private _data: NoticeData[];
  private _offset: number;
  private _limit: number;
  private _totalCount: number;

  constructor(
    notice: NoticeData[],
    offset: number,
    limit: number,
    totalCount: number
  ) {
    this._data = notice.map((value, index) => {
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
    this._totalCount = totalCount;
  }
  public replaceHost(newHost: string) {}

  public build() {
    return {
      data: this._data,
      _meta: {
        offset: this._offset,
        limit: this._limit,
        length: this._data.length,
        totalCount: this._totalCount,
      },
    };
  }
}
