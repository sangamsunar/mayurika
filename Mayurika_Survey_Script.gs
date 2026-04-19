/**
 * Mayurika – 3D Integrated Jewellery System
 * Google Apps Script — run createSurvey() to auto-generate the Google Form
 */
function createSurvey() {
  var form = FormApp.create('Mayurika - 3D Integrated Jewellery System: User-Centric Survey Analysis');
  form.setDescription(
    'This survey is conducted as part of the Mayurika project — an online jewellery platform featuring ' +
    '3D model visualisation, custom metal and purity selection, and direct ordering. ' +
    'Your responses help us understand customer needs and improve the platform. ' +
    'All responses are anonymous and used for academic/research purposes only.'
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);

  // ── SECTION 1: Jewellery Shopping Behaviour ───────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Section 1: Jewellery Shopping Behaviour')
    .setHelpText('Help us understand how often and why you buy jewellery.');

  form.addMultipleChoiceItem()
    .setTitle('How often do you purchase jewellery?')
    .setRequired(true)
    .setChoiceValues([
      'Rarely — only for special occasions (weddings, festivals)',
      'Once or twice a year as a gift or treat',
      'A few times a year for personal use',
      'Frequently — jewellery is a regular purchase for me'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('What motivates you most to buy jewellery?')
    .setRequired(true)
    .setChoiceValues([
      'Personal style and self-expression',
      'Gifting for occasions (weddings, birthdays, anniversaries)',
      'Investment value (gold, silver)',
      'Cultural or religious significance',
      'Trends and social media influence'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('Which type of jewellery do you buy most often?')
    .setRequired(true)
    .setChoiceValues([
      'Rings',
      'Necklaces and pendants',
      'Earrings',
      'Bracelets and bangles',
      'Sets (matching pieces)'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('Where do you currently buy jewellery?')
    .setRequired(true)
    .setChoiceValues([
      'Physical jewellery stores only',
      'Mostly physical stores, sometimes online',
      'Equally online and in-store',
      'Mostly online',
      'Online only'
    ]);

  // ── SECTION 2: Online Shopping for Jewellery ──────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Section 2: Online Jewellery Shopping')
    .setHelpText('Tell us about your experience shopping for jewellery online.');

  form.addMultipleChoiceItem()
    .setTitle('Have you ever purchased jewellery online?')
    .setRequired(true)
    .setChoiceValues([
      'Yes, multiple times',
      'Yes, once or twice',
      'No, but I am open to it',
      'No, I prefer buying in person'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('What is your biggest concern when buying jewellery online?')
    .setRequired(true)
    .setChoiceValues([
      'Cannot see or feel the actual product',
      'Unsure about quality and authenticity',
      'Incorrect size or fit',
      'Payment security and refund issues',
      'I have no major concerns'
    ]);

  var q7 = form.addCheckboxItem();
  q7.setTitle('What information do you look for before buying jewellery online? (Select up to 3)');
  q7.setRequired(true);
  q7.setChoices([
    q7.createChoice('Clear product images from multiple angles'),
    q7.createChoice('Metal type and purity details (e.g. 22K gold, 925 silver)'),
    q7.createChoice('Weight and dimensions'),
    q7.createChoice('Customer reviews and ratings'),
    q7.createChoice('Price breakdown (making charges, stone cost)'),
    q7.createChoice('Certification of authenticity')
  ]);
  q7.setValidation(
    FormApp.createCheckboxValidation()
      .setHelpText('Please select up to 3 options.')
      .requireSelectAtMost(3)
      .build()
  );

  form.addMultipleChoiceItem()
    .setTitle('How important are customer reviews when buying jewellery online?')
    .setRequired(true)
    .setChoiceValues([
      'Extremely important — I always read reviews before buying',
      'Important, but not the only factor',
      'Somewhat useful but not necessary',
      'I rarely rely on reviews'
    ]);

  // ── SECTION 3: 3D Visualisation ───────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Section 3: 3D Jewellery Visualisation')
    .setHelpText('Mayurika lets you view jewellery as an interactive 3D model. Tell us how useful this is to you.');

  form.addMultipleChoiceItem()
    .setTitle('How useful would a 3D interactive view of jewellery be before purchasing?')
    .setRequired(true)
    .setChoiceValues([
      'Extremely useful — it would greatly increase my confidence to buy',
      'Useful — better than flat images but not essential',
      'Somewhat useful',
      'Not useful — I still prefer seeing it in person'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How valuable is the ability to rotate and zoom a 3D jewellery model?')
    .setRequired(true)
    .setChoiceValues([
      'Very valuable — I want to see every angle before buying',
      'Helpful — especially for checking stone placement and finish',
      'Neutral',
      'Not important to me'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How likely would you be to buy jewellery online if you could see a realistic 3D model of it?')
    .setRequired(true)
    .setChoiceValues([
      'Much more likely',
      'Somewhat more likely',
      'No change — other factors matter more',
      'Still unlikely — I prefer in-person purchase'
    ]);

  // ── SECTION 4: Metal & Customisation ─────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Section 4: Metal, Purity & Customisation')
    .setHelpText('Tell us about your preferences for metal type and personalisation.');

  form.addMultipleChoiceItem()
    .setTitle('Which metal do you prefer for jewellery?')
    .setRequired(true)
    .setChoiceValues([
      'Gold (yellow)',
      'White gold',
      'Rose gold',
      'Silver',
      'Depends on the piece'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How important is knowing the exact purity (e.g. 24K, 22K, 18K) of a piece?')
    .setRequired(true)
    .setChoiceValues([
      'Extremely important — purity directly affects my buying decision',
      'Important — I always check before purchasing',
      'Somewhat important',
      'Not important to me'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How valuable is the ability to switch between gold, silver, and rose gold on the same 3D model?')
    .setRequired(true)
    .setChoiceValues([
      'Very valuable — I often want to compare metals before deciding',
      'Useful — saves me from imagining how it would look',
      'Neutral',
      'Not useful'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('Would you be interested in customising jewellery (metal, stone, size) on the platform?')
    .setRequired(true)
    .setChoiceValues([
      'Yes, definitely — customisation is very important to me',
      'Yes, sometimes for special pieces',
      'Neutral — I mostly buy ready-made pieces',
      'No — I prefer standard catalogue items'
    ]);

  // ── SECTION 5: Pricing & Trust ────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Section 5: Pricing Transparency & Trust')
    .setHelpText('Help us understand what builds your trust in an online jewellery platform.');

  var q17 = form.addCheckboxItem();
  q17.setTitle('Which factors influence your jewellery purchase decision the most? (Select up to 3)');
  q17.setRequired(true);
  q17.setChoices([
    q17.createChoice('Price and value for money'),
    q17.createChoice('Design and aesthetics'),
    q17.createChoice('Metal quality and purity'),
    q17.createChoice('Brand or seller reputation'),
    q17.createChoice('Stone quality (diamonds, gems)'),
    q17.createChoice('Making charges transparency')
  ]);
  q17.setValidation(
    FormApp.createCheckboxValidation()
      .setHelpText('Please select up to 3 options.')
      .requireSelectAtMost(3)
      .build()
  );

  form.addMultipleChoiceItem()
    .setTitle('How important is seeing a full price breakdown (gold cost + making charges + stone cost)?')
    .setRequired(true)
    .setChoiceValues([
      'Extremely important — hidden charges are a deal-breaker',
      'Important — I appreciate transparency',
      'Somewhat important',
      'Not important — I just look at the total price'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How important is a clear return and refund policy for jewellery?')
    .setRequired(true)
    .setChoiceValues([
      'Extremely important — I will not buy without it',
      'Important but not a deal-breaker',
      'Somewhat important',
      'Not important'
    ]);

  var q20 = form.addCheckboxItem();
  q20.setTitle('What makes an online jewellery platform trustworthy to you? (Select up to 2)');
  q20.setRequired(true);
  q20.setChoices([
    q20.createChoice('Verified seller / certified jewellery'),
    q20.createChoice('Positive customer reviews and ratings'),
    q20.createChoice('Transparent pricing with no hidden charges'),
    q20.createChoice('Secure payment options'),
    q20.createChoice('Professional and detailed product presentation')
  ]);
  q20.setValidation(
    FormApp.createCheckboxValidation()
      .setHelpText('Please select up to 2 options.')
      .requireSelectAtMost(2)
      .build()
  );

  // ── SECTION 6: Platform Features ─────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Section 6: Platform Features & Preferences')
    .setHelpText('Rate how useful specific platform features would be for you.');

  form.addMultipleChoiceItem()
    .setTitle('How useful is filtering jewellery by category (rings, necklaces, earrings, etc.)?')
    .setRequired(true)
    .setChoiceValues([
      'Very useful — I always browse by category',
      'Useful for narrowing down choices',
      'Neutral',
      'Not necessary'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How valuable is a wishlist feature for saving jewellery you are interested in?')
    .setRequired(true)
    .setChoiceValues([
      'Very valuable — I like to shortlist before deciding',
      'Useful but not essential',
      'Neutral',
      'Not important'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('Which payment option do you prefer when buying jewellery online?')
    .setRequired(true)
    .setChoiceValues([
      'Pay fully in advance for order confirmation',
      'Pay a deposit and complete payment later',
      'Cash on delivery',
      'Depends on the order value'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How important is order tracking after purchasing jewellery online?')
    .setRequired(true)
    .setChoiceValues([
      'Extremely important — I want real-time updates',
      'Important — at least email/SMS notifications',
      'Somewhat important',
      'Not important'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How useful would personalised jewellery recommendations be based on your preferences?')
    .setRequired(true)
    .setChoiceValues([
      'Very useful — I enjoy tailored suggestions',
      'Useful — it can help me discover new pieces',
      'Neutral',
      'Not useful — I prefer browsing on my own'
    ]);

  // ── SECTION 7: Pain Points ────────────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Section 7: Challenges & Expectations')
    .setHelpText('Help us understand the problems you face when shopping for jewellery.');

  var q26 = form.addCheckboxItem();
  q26.setTitle('What challenges do you commonly face when buying jewellery? (Select up to 3)');
  q26.setRequired(true);
  q26.setChoices([
    q26.createChoice('Difficulty judging quality from photos alone'),
    q26.createChoice('Lack of transparent pricing'),
    q26.createChoice('Unclear return or exchange policies'),
    q26.createChoice('Too many options with no guidance'),
    q26.createChoice('Difficulty choosing the right size'),
    q26.createChoice('Limited access to authentic certified jewellery')
  ]);
  q26.setValidation(
    FormApp.createCheckboxValidation()
      .setHelpText('Please select up to 3 options.')
      .requireSelectAtMost(3)
      .build()
  );

  var q27 = form.addCheckboxItem();
  q27.setTitle('What improvements would you most expect from an online jewellery platform? (Select up to 3)');
  q27.setRequired(true);
  q27.setChoices([
    q27.createChoice('Realistic 3D product visualisation'),
    q27.createChoice('Full price transparency'),
    q27.createChoice('Easy and secure checkout'),
    q27.createChoice('Verified and certified jewellery listings'),
    q27.createChoice('Real customer reviews with photos'),
    q27.createChoice('Easy size guide and customisation options')
  ]);
  q27.setValidation(
    FormApp.createCheckboxValidation()
      .setHelpText('Please select up to 3 options.')
      .requireSelectAtMost(3)
      .build()
  );

  // ── SECTION 8: Mayurika Specific ──────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle('Section 8: About Mayurika')
    .setHelpText('Your feedback specifically about the Mayurika platform.');

  form.addMultipleChoiceItem()
    .setTitle('How likely are you to use an online jewellery platform that offers interactive 3D model viewing?')
    .setRequired(true)
    .setChoiceValues([
      'Very likely',
      'Likely',
      'Not sure',
      'Unlikely'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('To what extent would integrated features (3D viewer, metal switching, price breakdown, order tracking) in a single platform improve your jewellery shopping experience?')
    .setRequired(true)
    .setChoiceValues([
      'Significantly improve — I prefer all features in one place',
      'Moderately improve — useful but not essential',
      'Slightly improve — I still prefer physical stores',
      'No improvement — online jewellery shopping does not interest me'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('How likely are you to write a review after purchasing jewellery from an online platform?')
    .setRequired(true)
    .setChoiceValues([
      'Very likely — I like sharing my experience',
      'Likely if the experience is notable (good or bad)',
      'Rarely',
      'Never'
    ]);

  form.addMultipleChoiceItem()
    .setTitle('What single feature would make Mayurika your go-to jewellery platform?')
    .setRequired(true)
    .setChoiceValues([
      'High-quality 3D model with realistic metal and stone rendering',
      'Full price transparency with no hidden charges',
      'Wide collection with verified quality',
      'Smooth and trustworthy checkout experience',
      'All of the above'
    ]);

  // ── Done ──────────────────────────────────────────────────────────────────
  var url = form.getPublishedUrl();
  var editUrl = form.getEditUrl();

  Logger.log('Form created successfully!');
  Logger.log('Share URL: ' + url);
  Logger.log('Edit URL:  ' + editUrl);

  Browser.msgBox(
    'Mayurika Survey Created!',
    'Share URL:\n' + url + '\n\nEdit URL:\n' + editUrl,
    Browser.Buttons.OK
  );
}
