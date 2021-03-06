import { Business } from "../entity/Entity";
import { replaceHost } from "../../services/util/http";
import { BusinessFeedData } from "../types/dataType";
export class BusinessFeedBuilder {
  private _data: BusinessFeedData[];
  private _offset: number;
  private _limit: number;
  private _totalCount: number;

  constructor(
    business: Business[],
    offset: number,
    limit: number,
    totalCount: number
  ) {
    this._offset = offset;
    this._limit = limit;
    this._totalCount = totalCount;
    this._data = business.map((value, index) => {
      return {
        id: value.id,
        title: value.title,
        businessHoursInfo: value.businessHoursInfo,
        url: value.image[0].url,
      };
    });
  }

  public replaceHost(newHost: string): BusinessFeedBuilder {
    this._data.map((value, index) => {
      this._data[index].url = replaceHost(this._data[index].url, newHost);
    });
    return this;
  }

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
