// import { Post } from "../entity/Entity";
// import { replaceHost } from "../../services/util/http";

// export interface BusinessFeedData {
//   postId: string;
//   title: string;
//   url: string;
//   view?: number;
//   detailTitle?: string;
//   address?: string;
//   startTime?: number;
//   endTime?: number;
//   homePage?: string;
//   workingHoursDescriptions?: string;
//   descriptions?: string;
// }

// export class BusinessFeedBuilder {
//   private _businessFeedData: BusinessFeedData[];

//   constructor(post: Post[]) {
//     const businessFeedData: BusinessFeedData[] = post.map((value, index) => {
//       return {
//         postId: value.postId,
//         title: value.title,
//         url: value.postImage[0].url,
//       };
//     });
//     this._businessFeedData = businessFeedData;
//   }

//   public replaceHost(newHost: string): BusinessFeedBuilder {
//     this._businessFeedData.map((value, index) => {
//       this._businessFeedData[index].url = replaceHost(
//         this._businessFeedData[index].url,
//         newHost
//       );
//     });
//     return this;
//   }

//   public build() {
//     return this._businessFeedData;
//   }
// }
