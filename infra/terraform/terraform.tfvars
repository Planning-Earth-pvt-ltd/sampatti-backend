environment    = "dev"             # or "staging" or whatever you want
instance_count = 2                 # exact number you need
instance_type  = "t2.micro"        # specific instance type
ami_id         = "ami-020cba7c55df1f615" # specific AMI you want
enable_ssh     = true              # or false if you don't need SSH
additional_tags = {
  Owner       = "Taran"
  Project     = "Share_Sampatti"
}
