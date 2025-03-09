<script>
	import main_cover from '$lib/img/main_cover.jpg?enhanced'
</script>

<div
	class="relative container h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
>
	<div class="bg-muted relative h-full flex-col p-10 text-white lg:flex dark:border-r">
		<!-- <div
	class="absolute inset-0 bg-cover"
	style="
		background-image:
			url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80);"
></div> -->
		<div class="relative z-20 flex flex-col items-center text-lg font-medium text-gray-400">
			<enhanced:img src={main_cover} alt="Authentication" class="block dark:hidden" />
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<!-- <p class="text-lg">&ldquo;This library has saved me. Highly recommended!&rdquo;</p> -->
				<footer class="text-sm">Hojun Lee</footer>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<div class="text-2xl lg:text-3xl">본격!</div>
				<h1 class="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-3xl">
					알리콘을 위한 대화방
				</h1>
				<div>
					<div class="my-10 flex h-60 w-full justify-center text-center align-middle">
						<div class="card card-hover variant-soft w-96">
							<header class="card-header font-bold">Sign In for alicorn Chat</header>
							<section class="flex h-full flex-col justify-center">
								<form method="post" action="?/Oauth2">
									<div>
										<button type="submit">
											<img
												src="/google_logo.svg"
												alt="google sign in"
												class="h-10 w-auto cursor-pointer"
											/>
										</button>
									</div>
								</form>
							</section>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
