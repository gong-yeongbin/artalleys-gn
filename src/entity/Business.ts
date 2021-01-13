import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
} from "typeorm";

import {
  BusinessPost,
  Location,
  Image,
  User,
  BusinessCategory,
} from "../entity/Entity";

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

  @Column({
    name: "details",
    type: "nvarchar",
    length: 300,
    nullable: true,
  })
  details: string;

  @OneToOne(() => Location, (location) => location.id)
  location: Location;

  @OneToMany(() => Image, (image) => image.business)
  @JoinColumn({ name: "image" })
  image: Image[];

  @OneToMany(() => BusinessPost, (businessPost) => businessPost.id)
  post: BusinessPost[];

  @ManyToOne(() => User, (user) => user.post, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user" })
  user: User;

  @ManyToOne(
    () => BusinessCategory,
    (BusinessCategory) => BusinessCategory.business,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn({ name: "category" })
  category: BusinessCategory;
}
