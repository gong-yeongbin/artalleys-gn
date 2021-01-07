import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Business, Comment, PostStatus } from "../entity/Entity";

@Entity("business_post")
export default class BusinessPost {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "title", type: "nvarchar", length: 30 })
  title: string;

  @Column({ name: "price", type: "integer", nullable: true })
  price: number;

  @Column({ name: "number", type: "integer", nullable: true })
  number: number;

  @Column({
    name: "details",
    type: "nvarchar",
    length: 300,
    nullable: true,
  })
  details: string;

  @Column({ name: "view_count", type: "integer", default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Business, (business) => business.posts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business_id" })
  business: Business;

  @OneToMany(() => Comment, (comment) => comment.id)
  comments: Comment[];
}
