terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "6.2.0"
    }
  }
}

provider "aws" {
  region = "us-east-1" # You'll need to provide this
}

module "ec2_instances" {
  source = "./modules/ec2-instance"

  environment    = var.environment
  instance_count = var.instance_count
  instance_type  = var.instance_type
  ami_id         = var.ami_id
  enable_ssh     = var.enable_ssh
  additional_tags = merge(var.additional_tags, {
    ManagedBy   = "Terraform"
    Environment = var.environment
  })
}