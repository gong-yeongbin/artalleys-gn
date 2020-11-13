import {
  Unique,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { PostLocation } from "../entity/PostLocation";
import { PostImage } from "../entity/PostImage";
import { Business } from "./Business";

@Entity("post")
@Unique(["postId"])
export class Post {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "post_Id", type: "nvarchar" })
  postId: string;

  @Column({ name: "type", type: "nvarchar" })
  type: string;

  @Column({ name: "title", type: "nvarchar", length: 30 })
  title: string;

  @Column({ name: "category", type: "nvarchar", length: 45 })
  category: string;

  @Column({ name: "price", type: "integer", nullable: true, default: 0 })
  price: number;

  @Column({
    name: "firm_on_price",
    type: "boolean",
    default: false,
  })
  firmOnPrice: boolean;

  @Column({
    name: "descriptions",
    type: "nvarchar",
    length: 300,
    nullable: true,
  })
  descriptions: string;

  @Column({ name: "condition", type: "nvarchar", length: 45 })
  condition: string;

  @Column({ name: "view", type: "integer", default: 0 })
  view: number;

  @Column({ name: "number", type: "integer", nullable: true })
  number: number;

  @Column({ name: "active", type: "nvarchar", default: "active" })
  active: string;

  @Column({
    name: "hide",
    type: "boolean",
    default: false,
  })
  hide: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => PostImage, (postImage) => postImage.post, {
    cascade: ["insert", "update", "remove"],
  })
  postImage: PostImage[];

  @OneToOne(() => PostLocation, (postLocation) => postLocation.post, {
    cascade: ["insert", "update", "remove"],
  })
  postLocation: PostLocation;

  @OneToOne(() => Business, (business) => business.post, {
    cascade: ["insert", "update", "remove"],
  })
  business: Business;
}
