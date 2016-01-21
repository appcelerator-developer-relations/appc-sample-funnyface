# Sample: Porting a Classic Titanium App to Alloy

> This guide and sample app was [published](http://www.appcelerator.com/blog/2016/01/appcelerator-titanium-cookbook-second-edition/) as part promoting [Appcelerator Titanium Smartphone App Development Cookbook – Second Edition](http://bit.ly/1OKmHD0), by Jason Kneen. It ports the classic <em>Funny Face</em> sample in chapter 7 to Alloy.

You can find the [source code for the original](classic) and [Alloy version](alloy) of the Funny Face Sample in this repository. Be aware that the original runs on iOS only and that the email dialog to send the photo requires you to run the app on a device.

## The Quick & Dirty Way

I hope you have been following the best practice to use a separate [CommonJS Module](http://docs.appcelerator.com/platform/latest/#!/guide/CommonJS_Modules_in_Titanium) for each view (window) of your classic Titanium app since this is also the pattern that Alloy follows. If you want it done and over with, then you could simply drop the classic code of each of your CommonJS modules in an Alloy controller and add one final line to tell Alloy what the top level view of that controller is:

	$.addTopLevelView(win1);

Then all you're left to do is wherever you used to require another CommonJS module to open the next screen, replace this with:

	Alloy.createController('myController').getView().open();
	
## The Better Way
However, let's do it the slightly less quick and clean way.

### 1. Move assets

Anything that will not become an Alloy controller, must be moved to either `app/assets` or `app/lib`. Both will be copied to `Resources` when Alloy compiles. However, it is best practice to keep code (utility libraries) in the lib folder and the rest in assets.

For our sample, all we had to do is move [Resources/images](Resources/images) to [app/assets/images](app/assets/images).
	
### 2. Create XML Markup</h4>

This is the hardest step. As you might know, elements in [Alloy XML Markup](http://docs.appcelerator.com/platform/latest/#!/guide/Alloy_XML_Markup) by default compile to `Ti.UI.create[Tag]([attributes])`. This helps us to create XML markup for all of these calls plus `[parent].add([child])`, which are used to create the view hierarchy in classic. Though I normally advise differently, for ports I suggest that you add an `id` attribute to all elements, using the original variable name as the value. This will help us in step 4.

**Classic**

	var win1 = Ti.UI.createWindow({
		backgroundColor: 'white'
	});
 
**XML**

	<Alloy>
		<Window id="win1">
			<!-- child views -->
		</Window>
	</Alloy>

### 3. Create TSS

Although both XML attributes and TSS properties compile to parameters for the `Ti.UI.create*()` calls, the easiest and also preferred way is to use TSS. You can pretty much copy the parameter object from the classic code and drop it in your TSS file. Use the IDs you added as part of the first step to assign the style to the right element.

**Classic**

	var win1 = Ti.UI.createWindow({
		backgroundColor: 'white'
	});
 
**TSS**
 
	"#win1": {
		backgroundColor: 'white'
	}

There are some properties I would create attributes for to make the XML Markup more readable, like Label texts, Button titles and the `image` property for ImageViews, much like you would in HTML.

### 4. Event Listeners

All we are left with for our controller is our logic. Some of the functions will be linked to views as event listener. Knowing that Alloy will compile XML attributes like `onClick="foo"` to `addEventListener('click', foo)`, name these (often anonymous) functions in your controller code and add the required attributes in the XML code.

**Classic**

	saveBtn.addEventListener('click', function(e) { .. });
	 
**XML**

	<Button id="saveBtn" onClick="onSaveClick" />

**Controller**

	function onSaveClick(e) { .. }

### 5. Resolve the view references

Finally, the controller logic will probably reference views it modifies or calls methods on. If you have used the original variable names as IDs as I suggested in the first step, then a step-by-step search and replace will do to prefix those references with `$.` as that object will hold references to them.

**Classic**

	win1.open();

**Controller**

	$.win1.open();
	
### 6. Test & Tidy

As you can see in [app/controllers/index.js](app/controllers/index.js) I left pretty much all of [Resources/app.js](Resources/app.js) intact. Normally you'd take this opportunity to tidy up your code a bit of course.

I did [fix some Android issues](https://github.com/appcelerator-developer-relations/appc-sample-funnyface/commit/5c7963966c36e15e2dc8793aef23d9c016b94a7e) and as you can see, I used Alloy's constants for [Conditional Code](http://docs.appcelerator.com/platform/latest/#!/guide/Alloy_Controllers-section-34636384_AlloyControllers-ConditionalCode) and the built-in [Measurement](http://docs.appcelerator.com/platform/latest/#!/api/Alloy.builtins.measurement) utility library.

> **Did you know that...** Though it is best practice, both `OS_IOS` and `Ti.Platform.name === 'iPhone OS'` will replaced with a boolean when Alloy compiles, and the code block removed when it's dead code for your target platform?

Now you have no more reasons left to switch to Alloy!