variable "environment" {
  description = "The deployment environment"
  type        = string
}

variable "instance_count" {
  description = "Number of EC2 instances to create"
  type        = number
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for the EC2 instances"
  type        = string
}

variable "enable_ssh" {
  description = "Whether to enable SSH access"
  type        = bool
}

variable "additional_tags" {
  description = "Additional tags for all resources"
  type        = map(string)
}