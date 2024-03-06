import UserHeader from "../components/UserHeader"
import UserPost from "../components/UserPost"

const UserPage = () => {
  return (
    <>
    <UserHeader/>
    <UserPost  likes={1200} replies={4} postImg="/post1.png" postTitle="Lets talk about threads"/>
    <UserPost  likes={450} replies={41} postImg="/post2.png" postTitle="Nice tutorial"/>
    <UserPost  likes={152} replies={81} postImg="/post3.png" postTitle="I love this guy"/>
    <UserPost  likes={483} replies={34}  postTitle="This is my first Post"/>
    
    </>
  )
}

export default UserPage