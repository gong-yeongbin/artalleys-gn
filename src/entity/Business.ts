import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  Unique,
} from "typeorm";

import {
  BusinessPost,
  Location,
  Image,
  User,
  BusinessCategory,
  BusinessLike,
  Comment,
  Report,
} from "../entity/Entity";

@Entity("business")
@Unique(["id"])
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

  @Column({ name: "start_working_hours", type: "integer" })
  startWorkingHours: number;

  @Column({ name: "end_working_hours", type: "integer" })
  endWorkingHours: number;

  @Column({ name: "business_hours_info", type: "nvarchar" })
  businessHoursInfo: string;

  @Column({ name: "homepage", type: "nvarchar" })
  homepage: string;

  @Column({ name: "like_count", type: "integer", default: 0 })
  likeCount: number;

  @Column({ name: "hide", type: "boolean", default: true })
  hide: boolean;

  @Column({
    name: "details",
    type: "nvarchar",
    length: 300,
    nullable: true,
  })
  details: string;

  @OneToOne(() => Location, (location) => location.business)
  @JoinColumn({ name: "location" })
  location: Location;

  @OneToMany(() => Image, (image) => image.business)
  @JoinColumn({ name: "image" })
  image: Image[];

  @OneToMany(() => BusinessPost, (businessPost) => businessPost.id)
  post: BusinessPost[];

  @ManyToOne(() => User, (user) => user.business, {
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

  @OneToMany(() => BusinessLike, (businessLike) => businessLike.business)
  @JoinColumn({ name: "post_like" })
  businessLike: BusinessLike;

  @OneToMany(() => Comment, (comment) => comment.id)
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.business)
  @JoinColumn({ name: "report" })
  report: Report[];
}
