import { ContactCsData } from "../types/dataType";
import { ContactCs } from "../entity/Entity";

export class ContactCsBuilder {
  private _data: ContactCsData;

  constructor(contactCs: ContactCs) {
    this._data = {
      id: contactCs.id,
      content: contactCs.content,
      answeringQuestions: contactCs.answeringQuestions,
      user: {
        id: contactCs.user.id,
        uid: contactCs.user.uid,
        nickName: contactCs.user.nickName,
        phoneNumber: contactCs.user.phoneNumber,
        email: contactCs.user.email,
      },
    };
  }
  public build() {
    return {
      data: this._data,
    };
  }
}
