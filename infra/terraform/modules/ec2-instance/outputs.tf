output "instances" {
  description = "All EC2 instance objects"
  value       = aws_instance.ec2
}

output "security_group_id" {
  description = "ID of the created security group"
  value       = aws_security_group.ec2_sg.id
}