import os
import json

class Guest:

	def __init__(self):
		self.name = None
		self.folder_name = None
		self.linkedin = None
		self.twitter = None
		self.instagram = None
		self.medium = None
		self.website = None
		self.github = None
		self.bio = None
		self.episode_title = None
		self.episode_link = None
		self.image = None

	def create_new_dir(self):
		newpath = f'./content/page/guests/{self.folder_name}/' 
		if not os.path.exists(newpath):
			try:
				os.makedirs(newpath)
			except OSError:
				print("Error")

	def create_new_md_file(self) -> str:
		md_file = f'---\ntitle: {self.name}\ntype: guests\nslug: guests/{self.folder_name}\nlinkedin: {self.linkedin}\nmedium: {self.medium}\ntwitter: {self.twitter}\ngithub: {self.github}\ninstagram: {self.instagram}\nsite: {self.website}\nlayout: "guestPage"\nimage: {self.image}\nbio: "{self.bio}"\nepisodes:\n    "{self.episode_title}": "{self.episode_link}"\n---'		
		return md_file

	def create_json_file(self) -> str:
		content = {"Name": f"{str(self.name)}", "Description": "", "url": f"{str(self.folder_name)}", "img": f"{str(self.image)}"}
		return json.dumps(content)

	def write_json_file(self, content: str):
		f = open(f'./data/guests/{self.folder_name}.json', "a")
		f.write(content)
		f.close()

	def write_md_file(self, content: str):
		f = open(f'./content/page/guests/{self.folder_name}/{self.folder_name}.md', "a")
		f.write(content)
		f.close()

	def add_new_guest(self):
		self.create_new_dir()
		self.write_md_file(self.create_new_md_file())
		self.write_json_file(self.create_json_file())



guest = Guest()

print("Enter guest's name in the format namesurname:")
guest.folder_name =input()

print("Enter guest's name in the format Name Surname:")
guest.name = input()

print("Enter guest's linkedin profile url:")
guest.linkedin = input()

print("Enter guest's twitter profile url:")
guest.twitter = input()

print("Enter guest's medium profile url:")
guest.medium = input()

print("Enter guest's github profile url:")
guest.github = input()

print("Enter guest's website url:")
guest.website = input()

print("Enter guest's instagram profile url:")
guest.instagram = input()

print("Enter guest's bio:")
guest.bio = input()

print("Enter guest's episode_link:")
guest.episode_link = input()

print("Enter guest's episode_title:")
guest.episode_title = input()

print("Enter guest's image:")
guest.image = input()

guest.add_new_guest()