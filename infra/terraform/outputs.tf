output "environment" {
  description = "The deployed environment name"
  value       = var.environment
}

output "instance_details" {
  description = "Details of all created EC2 instances"
  value = [for idx, instance in module.ec2_instances.instances : {
    id          = instance.id
    public_ip   = instance.public_ip
    private_ip  = instance.private_ip
    instance_type = instance.instance_type
    az          = instance.availability_zone
  }]
}

output "security_group_id" {
  description = "ID of the created security group"
  value       = module.ec2_instances.security_group_id
}