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
      url: business.image[0].url,
      category: business.category.category,
      location: {
        longitude: business.location.longitude,
        latitude: business.location.latitude,
      },
    };
  }

  public replaceHost(newHost: string): BusinessBuilder {
    this._data.url = replaceHost(this._data.url, newHost);
    return this;
  }

  public build() {
    return {
      data: this._data,
    };
  }
}
