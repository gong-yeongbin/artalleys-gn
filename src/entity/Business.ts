import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

import { BusinessPost, Location, PostImage } from "../entity/Entity";

@Entity("business")
export default class Business {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "title" })
  title: string;

  @Column({ name: "detail_title", type: "nvarchar" })
  detailTitle: string;

  @Column({ name: "address", type: "nvarchar" })
  address: string;

  @Column({ name: "number", type: "integer" })
  number: number;

  @Column({ name: "start_working_hours", type: "nvarchar" })
  startWorkingHours: string;

  @Column({ name: "end_working_hours", type: "nvarchar" })
  endWorkingHours: string;

  @Column({ name: "business_hours_info", type: "nvarchar" })
  businessHoursInfo: string;

  @Column({ name: "homepage", type: "nvarchar" })
  homepage: string;

  @OneToOne(() => Location, { onDelete: "CASCADE" })
  @JoinColumn({ name: "location_id" })
  location: Location;

  @OneToOne(() => PostImage, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "image_id" })
  image: PostImage;

  @OneToMany(() => BusinessPost, (businessPost) => businessPost.id)
  posts: BusinessPost[];
}
