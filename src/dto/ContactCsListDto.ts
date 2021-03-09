import { ContactCsData } from "../types/dataType";
import { ContactCs } from "../entity/Entity";

export class ContactCsListBuilder {
  private _data: ContactCsData[];
  private _offset: number;
  private _limit: number;
  private _order: "DESC" | "ASC";
  private _totalCount: number;

  constructor(
    contactCsList: ContactCs[],
    offset: number,
    limit: number,
    order: "DESC" | "ASC",
    totalCount: number
  ) {
    this._data = contactCsList.map((value, index) => {
      return {
        id: value.id,
        content: value.content,
        answeringQuestions: value.answeringQuestions,
        user: {
          id: value.user.id,
          uid: value.user.uid,
          nickName: value.user.nickName,
          phoneNumber: value.user.phoneNumber,
          email: value.user.email,
        },
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
