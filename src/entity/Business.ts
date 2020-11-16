import {
  Unique,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Image } from "../entity/Image";
import { Location } from "../entity/Location";

@Entity("business")
@Unique(["businessId"])
export class Business {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "post_Id", type: "nvarchar" })
  businessId: string;

  @Column({ name: "title", type: "nvarchar", length: 30 })
  title: string;

  @Column({ name: "detailTitle", type: "nvarchar", length: 120 })
  detailTitle: string;

  @Column({ name: "address", type: "nvarchar", length: 1024 })
  address: string;

  @Column({ name: "number", type: "integer", nullable: true })
  number: number;

  @Column({ name: "start_time", type: "integer", default: 0 })
  startTime: number;

  @Column({ name: "end_time", type: "integer", default: 0 })
  endTime: number;

  @Column({
    name: "working_hours_descriptions",
    type: "nvarchar",
    length: 1024,
  })
  workingHoursDescriptions: string;

  @Column({
    name: "homepage",
    type: "nvarchar",
    length: 1024,
  })
  homepage: string;

  @Column({
    name: "descriptions",
    type: "nvarchar",
    length: 300,
  })
  descriptions: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Image, (image) => image.business, {
    cascade: ["insert", "update", "remove"],
  })
  businessImage: Image[];

  @OneToOne(() => Location, (location) => location.business, {
    cascade: ["insert", "update", "remove"],
  })
  businessLocation: Location;
}
