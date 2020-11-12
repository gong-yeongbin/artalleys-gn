import { Post } from "../../entity/Post";
import { replaceHost } from "../../../services/util/http";

export interface PostData {
  postId: string;
  title: string;
  price: number;
  active: string;
  url: string;
}

export class FeedBuilder {
  private _postData: PostData[];

  constructor(post: Post[]) {
    const postData: PostData[] = post.map((value, index) => {
      return {
        postId: value.postId,
        title: value.title,
        price: value.price,
        active: value.active,
        url: value.postImage[0].url,
      };
    });
    this._postData = postData;
  }

  public replaceHost(newHost: string): FeedBuilder {
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
