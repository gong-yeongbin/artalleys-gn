import { Comment } from "../entity/Entity";
import { CommentData } from "../types/dataType";
import { replaceHost } from "../../services/util/http";
export class CommentBuilder {
  private _data: CommentData[];
  private _meta: object;

  constructor(
    comment: Comment[],
    offset: number,
    limit: number,
    order: string,
    totalCount: number
  ) {
    this._data = comment.map((value, index) => {
      return {
        id: value.id,
        message: value.message,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
        user: {
          userId: value.user.id,
          nickName: value.user.nickName,
          url: value.user.image == null ? "" : value.user.image.url,
        },
      };
    });

    this._meta = {
      offset: offset,
      limit: limit,
      order: order,
      totalCount: totalCount,
    };
  }

  public replaceHost(newHost: string): CommentBuilder {
    this._data.map((value, index) => {
      this._data[index].user.url = replaceHost(
        this._data[index].user.url,
        newHost
      );
    });
    return this;
  }

  public build() {
    return {
      data: this._data,
      _meta: this._meta,
    };
  }
}
