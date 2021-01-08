import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import {
  User,
  Location,
  PostCategory,
  PostCondition,
  Image,
  PostStatus,
  PostType,
} from "../entity/Entity";

@Entity("post")
export default class Post {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "title", type: "nvarchar", length: 30 })
  title: string;

  @Column({
    name: "details",
    type: "nvarchar",
    length: 300,
    nullable: true,
  })
  details: string;

  @Column({ name: "hide_yn", type: "boolean", default: false })
  hideYn: boolean;

  @Column({ name: "price", type: "integer", nullable: true })
  price: number;

  @Column({ name: "number", type: "integer", nullable: true })
  number: number;

  @Column({ name: "negotiable_price_yn", type: "boolean", default: false })
  negotiablePriceYn: boolean;

  @Column({ name: "view_count", type: "integer", default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToOne(() => Location, { onDelete: "CASCADE" })
  @JoinColumn({ name: "location_id" })
  location: Location;

  @OneToOne(() => Image, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "image_id" })
  image: Image;

  @OneToOne(() => PostStatus)
  @JoinColumn({ name: "status_id" })
  status: PostStatus;

  @OneToOne(() => PostCategory)
  @JoinColumn({ name: "category_id" })
  category: PostCategory;

  @OneToOne(() => PostCondition)
  @JoinColumn({ name: "condition_id" })
  condition: PostCondition;

  @OneToOne(() => PostType)
  @JoinColumn({ name: "type_id" })
  type: PostType;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business_id" })
  user: User;
}