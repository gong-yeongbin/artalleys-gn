import { Post } from "../entity/Entity";
import { replaceHost } from "../../services/util/http";
import { FeedData } from "../types/dataType";
export class PostFeedBuilder {
  private _data: FeedData[];
  private _offset: number;
  private _limit: number;
  private _order: string;
  private _totalCount: number;

  constructor(
    post: Post[],
    offset: number,
    limit: number,
    order: string,
    totalCount: number
  ) {
    this._offset = offset;
    this._limit = limit;
    this._order = order;
    this._totalCount = totalCount;
    this._data = post.map((value, index) => {
      return {
        id: value.id,
        title: value.title,
        status: value.status.status,
        category: value.category.category,
        price: value.price,
        url: value.image[0].url,
        likeCount: value.likeCount,
      };
    });
  }

  public replaceHost(newHost: string): PostFeedBuilder {
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
        order: this._order,
        totalCount: this._totalCount,
      },
    };
  }
}
