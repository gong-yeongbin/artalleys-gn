import {
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  Entity,
  OneToOne,
  Unique,
} from "typeorm";
import { User, ReportCategory, Post, Business, BusinessPost } from "./Entity";

@Entity("report")
@Unique(["businessPost", "business", "post", "user"])
export default class Report {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "content", type: "nvarchar" })
  content: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToOne(() => ReportCategory, (reportCategory) => reportCategory.id)
  @JoinColumn({ name: "category" })
  category: ReportCategory;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user" })
  user: User;

  @ManyToOne(() => Post, (post) => post.id, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post" })
  post: Post;

  @ManyToOne(() => Business, (business) => business.id, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business" })
  business: Business;

  @ManyToOne(() => BusinessPost, (businessPost) => businessPost.id, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "businessPost" })
  businessPost: BusinessPost;
}
