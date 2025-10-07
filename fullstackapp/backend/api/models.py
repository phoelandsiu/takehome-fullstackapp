from django.db import models

# Create your models here.
class User(models.Model):
    age = models.IntegerField()
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    author = models.CharField(max_length=100)
    text = models.TextField()
    date = models.CharField(max_length=100)
    likes = models.IntegerField()
    image = models.CharField(max_length=250)

    class Meta:
        db_table = "comments"
        # managed = True