import { Business } from "../entity/Entity";
import { BusinessType } from "../types/dataType";
import { replaceHost } from "../../services/util/http";

export class BusinessBuilder {
  private _data: BusinessType;

  constructor(business: Business) {
    this._data = {
      id: business.id,
      title: business.title,
      detailTitle: business.detailTitle,
      address: business.address,
      number: business.number,
      startWorkingHours: business.startWorkingHours,
      endWorkingHours: business.endWorkingHours,
      businessHoursInfo: business.businessHoursInfo,
      homepage: business.homepage,
      details: business.details,
      url: [],
      category: business.category.category,
      likeCount: business.likeCount,
      location: {
        longitude: business.location.longitude,
        latitude: business.location.latitude,
        city: business.location.city,
      },
    };
    business.image.map((value, index) => {
      this._data.url.push(value.url);
    });
  }

  public replaceHost(newHost: string): BusinessBuilder {
    this._data.url.map((value, index) => {
      this._data.url[index] = replaceHost(this._data.url[index], newHost);
    });
    return this;
  }

  public build() {
    return {
      data: this._data,
    };
  }
}
