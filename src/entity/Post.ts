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
  RelationId,
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

  @Column({ name: "non_negotiable_price_yn", type: "boolean", default: false })
  nonNegotiablePriceYn: boolean;

  @Column({ name: "view_count", type: "integer", default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToOne(() => Location)
  @JoinColumn({ name: "location" })
  location: Location;

  @OneToMany(() => Image, (image) => image.id)
  @JoinColumn({ name: "image" })
  image: Image[];

  @ManyToOne(() => PostStatus, (postStatus) => postStatus.post, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "status" })
  status: PostStatus;

  @ManyToOne(() => PostCategory, (postCategory) => postCategory.post, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "category" })
  category: PostCategory;

  @ManyToOne(() => PostCondition, (postCondition) => postCondition.id)
  @JoinColumn({ name: "condition" })
  condition: PostCondition;

  @ManyToOne(() => PostType, (postType) => postType.id)
  @JoinColumn({ name: "type" })
  type: PostType;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business" })
  user: User;
}
