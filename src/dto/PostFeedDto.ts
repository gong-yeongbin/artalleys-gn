import { Post } from "../entity/Entity";
import { replaceHost } from "../../services/util/http";

export interface PostFeedData {
  postId: string;
  title: string;
  price: number;
  active: string;
  url: string;
}

export class PostFeedBuilder {
  private _postData: PostFeedData[];

  constructor(post: Post[]) {
    const postData: PostFeedData[] = post.map((value, index) => {
      return {
        postId: value.postId,
        title: value.title,
        view: value.view,
        price: value.normal.price,
        active: value.normal.active,
        url: value.postImage[0].url,
      };
    });
    this._postData = postData;
  }

  public replaceHost(newHost: string): PostFeedBuilder {
    this._postData.map((value, index) => {
      this._postData[index].url = replaceHost(
        this._postData[index].url,
        newHost
      );
    });
    return this;
  }

  public build() {
    return this._postData;
  }
}
