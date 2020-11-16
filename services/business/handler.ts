import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import * as crypto from "crypto";
import { Business } from "../../src/entity/Business";
import { Image } from "../../src/entity/Image";
import { Location } from "../../src/entity/Location";
import { putObject, sendMessage } from "../util/aws";

export const createBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  // const connection = await getDatabaseConnection();
  // const businessRepository = connection.getRepository(Business);
  // const locationRepository = connection.getRepository(Location);
  // const imageRepository = connection.getRepository(Image);

  const uid: string = event.pathParameters["uid"];
  const businessId = crypto.randomBytes(10).toString("hex");
  const data: any = JSON.parse(event.body);

  let business: Business = new Business();
  let location: Location = new Location();

  let {
    title,
    detailTitle,
    address,
    number,
    workingHoursDescriptions,
    homepage,
    descriptions,
  }: Business = data;

  location.longtitude = data.location.longtitude;
  location.latitude = data.location.latitude;
  // await locationRepository.save(location);

  business.businessId = businessId;
  business.title = title;
  business.detailTitle = detailTitle;
  business.address = address;
  business.number = number;
  business.workingHoursDescriptions = workingHoursDescriptions;
  business.homepage = homepage;
  business.descriptions = descriptions;
  business.businessLocation = location;
  // await businessRepository.save(business);

  for (let index in data.image) {
    let imageName = crypto.randomBytes(10).toString("hex");

    // await imageRepository
    //   .createQueryBuilder()
    //   .insert()
    //   .into(Image)
    //   .values({
    //     business: business,
    //     url: `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/${uid}/business/${businessId}/origin/${imageName}.png`,
    //   })
    //   .execute();

    const originalImage = Buffer.from(data.image[index], "base64");

    await putObject(
      originalImage,
      `${uid}/business/${businessId}/origin/${imageName}.png`
    );
    await sendMessage(`${uid}/business/${businessId}/origin/${imageName}.png`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(event),
  };
};
