variable "environment" {
  description = "The deployment environment (dev, staging, production, etc.)"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9_-]+$", var.environment))
    error_message = "Environment name must be alphanumeric with hyphens/underscores."
  }
}

variable "instance_count" {
  description = "Number of EC2 instances to create (MUST be provided)"
  type        = number
}

variable "instance_type" {
  description = "EC2 instance type (MUST be provided)"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for the EC2 instances (MUST be provided)"
  type        = string
}

variable "enable_ssh" {
  description = "Whether to enable SSH access (true/false)"
  type        = bool
}

variable "additional_tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}