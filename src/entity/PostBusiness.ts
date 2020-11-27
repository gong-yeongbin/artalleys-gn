import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("post_business")
export default class PostBusiness {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "detail_title" })
  detailTitle: string;

  @Column({ name: "address" })
  address: string;

  @Column({ name: "start_time", type: "integer", default: 0 })
  startTime: number;

  @Column({ name: "end_time", type: "integer", default: 0 })
  endTime: number;

  @Column({ name: "homepage" })
  homepage: string;

  @Column({
    name: "working_hours_descriptions",
    type: "nvarchar",
    length: 1024,
  })
  workingHoursDescriptions: string;

  @Column({
    name: "descriptions",
    type: "nvarchar",
    length: 300,
  })
  descriptions: string;
}
