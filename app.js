const projectUrl = "https://eolieqckkjyalixpgwwr.supabase.co"
const projectKey = "sb_publishable_-BEanwWNvfoGjt0PlTMWJg_yWPHCnB-"

const { createClient } = supabase;
const client = createClient(projectUrl, projectKey)

console.log(createClient);
console.log(client);



// =====signup work=========

const password = document.getElementById("password");
const email = document.getElementById("email");
const username = document.getElementById("name");
const profileImg = document.getElementById("profileImg");
const btn = document.getElementById("btn");

btn && btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const userValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    // Empty fields
    if (userValue === "" || emailValue === "" || passwordValue === "" || !profileImg.files[0]) {
        Swal.fire({
            icon: "warning",
            title: "Oops!",
            text: "Please fill all fields"
        });
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Email",
            text: "Please enter a valid email address"
        });
        return;
    }

    // Password validation
    if (passwordValue.length < 6) {
        Swal.fire({
            icon: "error",
            title: "Weak Password",
            text: "Password must be at least 6 characters"
        });
        return;
    }

    // Signup
    const { data, error } = await client.auth.signUp({
        email: emailValue,
        password: passwordValue,
        options: {
            data: {
                username: userValue,
                // role: "user"
            }
        }
    });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Signup Failed",
            text: error.message
        });
        return;
    }

    // Success alert
    Swal.fire({
        icon: "success",
        title: "Account Created 🎉",
        text: "Your account has been created successfully",
        timer: 2000,
        showConfirmButton: false
    });

    // ===== Image Upload =====
    const profileImgFile = profileImg.files[0];
    const fileName = `${Date.now()}-${profileImgFile.name}`;

    const { error: uploadError } = await client.storage
        .from("user_profile")
        .upload(fileName, profileImgFile, { upsert: true });

    if (uploadError) {
        Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: "Profile image upload failed"
        });
        return;
    }

    // ===== Get Public URL =====
    const { data: imgData } = client.storage
        .from("user_profile")
        .getPublicUrl(fileName);

    const profileImageUrl = imgData.publicUrl;

    // ===== Insert User Data =====
    const { error: insertError } = await client
        .from("user-profiles")
        .insert({
            name: data.user.user_metadata.username,
            email: data.user.email,
            // role: data.user.user_metadata.role,
            user_id: data.user.id,
            profile_img: profileImageUrl,
        });

    if (!insertError) {
        window.location.href = "index.html";

    }
});

// -==========show profile Desktop ========
async function showProfileImg() {
    let showImg = document.getElementById("showImg")
    if (!showImg) return
    const { data: getUserData, error: getErr } = await client.auth.getUser()

    if (getErr) {
        console.log(getErr)
        return
    }

    let userId = getUserData.user.id

    const { data: fetchData, error: fetchErr } = await client
        .from('user-profiles')
        .select('*')
        .eq('user_id', userId)

    if (fetchErr) {
        console.log(fetchErr)
    } else {
        fetchData.forEach(img => {
            showImg.innerHTML += `
        <div class="flex items-center gap-2">
          <span class="text-white font-bold">${img.name}</span>
          <img src="${img.profile_img}"
               class="rounded-full"
               style="width:45px;height:45px;box-shadow:0 0 10px white"
               alt="profile" />
        </div>
      `
        })
    }
}

showProfileImg()




// ============= login ============

const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const loginBtn = document.getElementById("loginBtn");

loginBtn && loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // ❌ empty check
    if (loginEmail.value.trim() === "" || loginPass.value.trim() === "") {
        Swal.fire({
            icon: "warning",
            title: "Missing Fields",
            text: "Please fill all fields"
        });
        return;
    }

    // ❌ password length check
    if (loginPass.value.length < 6) {
        Swal.fire({
            icon: "error",
            title: "Invalid Password",
            text: "Password must be at least 6 characters"
        });
        return;
    }

    // ⏳ loading
    Swal.fire({
        title: "Logging in...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const { data, error } = await client.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPass.value,
    });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: error.message
        });
        return;
    }



    // ✅ success + redirect
    Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: "Redirecting...",
        timer: 1500,
        showConfirmButton: false
    });



    setTimeout(() => {
        window.location.href = "home.html"
    }, 1500)

});

// =======LOGOUT======


const logout = document.getElementById("logout");

logout && logout.addEventListener("click", async () => {

    // 🔔 confirm before logout
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to logout from your account",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#475569",
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    // ⏳ loading
    Swal.fire({
        title: "Logging out...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const { error } = await client.auth.signOut();

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Logout Failed",
            text: error.message
        });
    } else {
        Swal.fire({
            icon: "success",
            title: "Logged out 👋",
            text: "See you again!",
            timer: 1500,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    }
});

const mobilelogout = document.getElementById("mobilelogout");

mobilelogout && mobilelogout.addEventListener("click", async () => {
    window.location.href = "index.html"
})


// =========INSERT TABLE IN SUPABASE========

const title = document.getElementById("title")
const content = document.getElementById("content")
const postImg = document.getElementById("postImg")
const postBtn = document.getElementById("postBtn")

postBtn && postBtn.addEventListener("click", async (e) => {
    e.preventDefault()

    // ===== VALIDATION =====
    if (!title.value.trim()) {
        Swal.fire("Error", "Title is required", "error")
        return
    }

    if (!postImg.files.length) {
        Swal.fire("Error", "Please select an image", "error")
        return
    }

    if (!content.value.trim()) {
        Swal.fire("Error", "Content is required", "error")
        return
    }

    let file = postImg.files[0]
    let fileName = `${Date.now()}-${file.name}`

    // ===== IMAGE UPLOAD =====
    const { data, error } = await client
        .storage
        .from('user-post')
        .upload(fileName, file, { upsert: true })

    if (error) {
        Swal.fire("Upload Failed", error.message, "error")
        return
    }

    // ===== GET IMAGE URL =====
    const { data: imgUrl } = client
        .storage
        .from('user-post')
        .getPublicUrl(fileName)

    let postImgUrl = imgUrl.publicUrl

    const { data: getUserData, error: getErr } = await client.auth.getUser()

    let userIds = getUserData.user.id
    let byName = getUserData.user.user_metadata.username
    // ===== INSERT POST =====
    const { error: insertError } = await client
        .from('user-posts')
        .insert({
            user_id: userIds,
            name: byName,
            title: title.value,
            description: content.value,
            post_pic: postImgUrl
        })

    if (insertError) {
        Swal.fire("Error", insertError.message, "error")
    } else {
        Swal.fire({
            title: "Success 🎉",
            text: "Post published successfully!",
            icon: "success"
        })

        // reset form
        title.value = ""
        content.value = ""
        postImg.value = ""
    }
})

// =========NAME SHOW======

try {
    const userName = document.getElementById("username")
    const { data: getUserData, error: getErr } = await client.auth.getUser()

    userName.textContent = getUserData.user.user_metadata.username

} catch (error) {
    console.log(error);

}
// =======ALL POST======

const allPost = document.getElementById("allPost")

if (allPost) {

    const { data, error } = await client
        .from('user-posts')
        .select("*")

    if (error) {
        console.log(error);
    } else {

        data.forEach((post) => {
            console.log(post);
            allPost.innerHTML += `

 <div class=" w-[350px] hover:scale-102 bg-black rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300">

    <!-- Image -->
    <div class="overflow-hidden">
      <img
        src="${post.post_pic}"
        alt="post image"
        class="w-full p-4 h-[280px] rounded-[40px] object-cover transition duration-300"
      />
    </div>


 <div class="px-5 pb-5">
      <h2 class="text-xl font-semibold text-white mb-1 line-clamp-1">
        ${post.title}
      </h2>

 <p class="text-xs text-white tracking-wider mb-1"> By ${post.name}
  ${new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric"
            })}
</p>
      <!-- Description -->
      <p class="text-sm text-white line-clamp-3 mb-4">
        ${post.description}
      </p>

      <!-- Button -->
   
<button
    onClick="window.location.href='detail.html?id=${post.id}'"
    class="w-full py-3 text-xl font-medium flex items-center gap-2 justify-center text-white bg-blue-500  rounded-full hover:bg-black hover:text-white hover:border border-white transition-animation duration-300">
    Read More <i class="fa-solid fa-arrow-right-long fa-xs"></i>
</button>


    </div>
  </div>
`
        })
    }
}


async function fetchMyPosts() {
    const myPost = document.getElementById("myPost")

    const { data: getUserData, error: getErr } = await client.auth.getUser()

    let userID = getUserData.user.id


    const { data: postData, error: postErr } = await client
        .from('user-posts')
        .select("*")
        .eq("user_id", userID)
    console.log(userID);


    if (postErr) {
        console.log(postErr)
    } else {
        postData.forEach(post => {
            myPost.innerHTML += `
     
  <div id="post-${post.id}"  class=" w-[350px] hover:scale-102 bg-black rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300">

    <div class="overflow-hidden">
      <img
        src="${post.post_pic}"
        alt="post image"
        class="w-full p-4 h-[280px] rounded-[40px] object-cover transition duration-300"
      />
    </div>

   
    <div class="px-5 pb-5">
      <h2 class="text-2xl font-semibold text-white mb-2 line-clamp-1">
        ${post.title}
      </h2>

    
      <p class="text-md text-white line-clamp-2 mb-4">
        ${post.description}
      </p>

 
     <div class="flex gap-3">
      <button onClick="editBtn(${post.id} , '${post.title}' , '${post.description}' )"
        class="w-full py-3 text-2xl flex items-center justify-center gap-2 font-medium text-white bg-green-600 rounded-full hover:bg-black hover:text-white hover:border border-white transition-animation duration-300">
       Edit <i class="fa-solid fa-pen-to-square fa-xs"></i>
      </button>

      <button onClick="deleteBtn(${post.id})"
        class="w-full py-3 text-2xl flex items-center justify-center gap-2 font-medium text-white bg-red-600 rounded-full hover:bg-black hover:text-white hover:border border-white transition-animation duration-300"">
     Delete <i class="fa-regular fa-trash-can fa-xs"></i>
      </button>
      </div>

    </div>
  </div>
`

        })
    }
}

fetchMyPosts()


// =========DELETE post ========
window.deleteBtn = async function (id) {
    // 🔔 Confirm before delete
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return; // Agar user cancel kare to return

    // 🔄 Delete from Supabase
    const { error } = await client
        .from('user-posts')
        .delete()
        .eq('id', id);

    if (error) {
        Swal.fire({
            icon: 'error',
            title: 'Delete failed',
            text: error.message
        });
        return;
    }

    // ✅ UI se turant remove
    const postCard = document.getElementById(`post-${id}`);
    if (postCard) postCard.remove();

    // 🎉 Success alert
    Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Your post has been deleted.',
        timer: 1500,
        showConfirmButton: false
    });
};


window.editBtn = async function (id, title, description) {

    const { value: formValues } = await Swal.fire({
        width: 700,
        showCancelButton: true,
        confirmButtonText: "Update",
        html: `
      <div class="relative p-4 my-5 bg-gray-100 border border-gray-300 rounded-2xl sm:p-5">

  <!-- Header -->
  <div class="flex justify-between items-center pb-4 mb-4 border-b">
    <h3 class="text-2xl font-semibold text-gray-900">
       Update Product
     </h3>
   </div>

   <!-- Body -->
   <div class="grid gap-4 mb-4 sm:grid-cols-2">

    <div>
       <label class="block mb-2 text-start text-lg font-bold">Title</label>
       <input id="uptitle" type="text"
         class="border rounded-lg p-2.5 w-full"
         value="${title}">
     </div>

     <div>
       <label class="block mb-2 text-start text-lg font-bold">Content</label>
       <input id="upDes" type="text"
         class="border rounded-lg p-2.5 w-full"
         value="${description}">
    </div>


     <div>
       <label class="block mb-2 text-start text-lg font-bold">Update Image</label>
       <input type="file" id="updateimg"
         class="border rounded-lg p-2.5  w-full">
     </div>



   </div>

 </div>
 `,

        preConfirm: () => ({
            title: document.getElementById("uptitle").value.trim(),
            description: document.getElementById("upDes").value.trim(),
            imageFile: document.getElementById("updateimg").files[0] || null
        })
    })

    if (!formValues) return

    let updatedData = {
        title: formValues.title,
        description: formValues.description
    }

    if (formValues.imageFile) {
        const file = formValues.imageFile
        const fileName = `${Date.now()}-${file.name}`

        const { error } = await client.storage
            .from('user-post')
            .upload(fileName, file, { upsert: true })

        if (error) return Swal.fire("Error", "Image upload failed", "error")

        const { data } = client.storage
            .from('user-post')
            .getPublicUrl(fileName)

        updatedData.post_pic = data.publicUrl
    }

    const { error } = await client
        .from('user-posts')
        .update(updatedData)
        .eq('id', id)

    if (error) return Swal.fire("Error", error.message, "error")

    Swal.fire("Updated 🎉", "Post updated successfully", "success")

    const myPost = document.getElementById("myPost")
    if (myPost) myPost.innerHTML = ""
    fetchMyPosts()
}


// =========DETAIL=====

const params = new URLSearchParams(window.location.search)
const productId = params.get("id")
let currentProduct = null
console.log(productId);

if (productId) {
    const { data: post, error } = await client
        .from('user-posts')
        .select("*")
        .eq('id', productId)
        .single();

    if (error) {
        console.error(error);
    } else {

        const container = document.getElementById("postDetailContainer");

        container.innerHTML = `
  <div class="max-w-2xl mx-auto bg-black rounded-4xl hover:scale-102 transition-animation duration-500 shadow-lg overflow-hidden p-6">

    <!-- Image -->
    <div class="w-full h-80 overflow-hidden rounded-3xl mb-4">
      <img 
        src="${post.post_pic}" 
        alt="${post.title}" 
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Content -->
    <div class="px-2">
      <p class="text-xs text-white mb-2">
        ${new Date(post.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })}
      </p>

      <h1 class="text-2xl font-bold text-white mb-3">
        ${post.title}
      </h1>

      <p class= text-white text-sm leading-relaxed">
        ${post.description}
      </p>

      <!-- Button -->
      <div class="mt-6">
        <button 
          onclick="window.location.href='allPost.html'"
          class="bg-white hover:bg-black hover:text-white hover:border border-white text-black px-10 py-4 rounded-full font-medium transition-animation duration-300 text-xl tracking-wide"
        >
          Back to Posts
        </button>
      </div>
    </div>

  </div>
`;



    }
}