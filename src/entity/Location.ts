import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Post } from "./Post";
import { Business } from "./Business";

@Entity("location")
export class Location {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "longtitude", type: "integer" })
  longtitude: number;

  @Column({ name: "latitude", type: "integer" })
  latitude: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToOne(() => Post, (post) => post.postLocation, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post" })
  post: Post;

  @OneToOne(() => Business, (business) => business.businessLocation, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business" })
  business: Business;
}
