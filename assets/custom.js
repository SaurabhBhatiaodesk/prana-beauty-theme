function si(id, key) {
  const el = document.getElementById(id);
  //if (el && IMGS[key]) el.src = IMGS[key];
}


// ── ROUTING ──
let currentPage = 'home';
let currentPDP  = 'saffron-serum';
let qty = 1;
let cart = 0;



function tab(id) {
  // Remove 'on' from all rtab buttons
  document.querySelectorAll('.rtab').forEach(el => el.classList.remove('on'));
  document.querySelectorAll('.rc').forEach(el => el.classList.remove('on'));
  // Add 'on' to the clicked tab and its content
  const tabs = document.querySelectorAll('.rtab');
  const contents = ['am','pm','wk'];
  const idx = contents.indexOf(id);
  if (idx >= 0) tabs[idx].classList.add('on');
  const content = document.getElementById('t-' + id);
  if (content) { content.classList.add('on'); initReveal(); }
}



function scrollToScan() {
  const el = document.getElementById('findYourRitual');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}




// ── EMAIL SLIDE-IN ──
let emailSlideShown = false;

function initEmailSlide() {
  if (emailSlideShown) return;
  // Trigger: after user scrolls past product carousel
  const productsSection = document.getElementById('productsSection');
  if (!productsSection) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      // Trigger when products section scrolls OUT of view (user has seen it)
      if (!entry.isIntersecting && !emailSlideShown) {
        // Small delay so it doesn't pop instantly
        setTimeout(openEmailSlide, 800);
        observer.disconnect();
      }
    });
  }, { threshold: 0 });

  observer.observe(productsSection);
}

function openEmailSlide() {
  if (emailSlideShown) return;
  emailSlideShown = true;
  const slide = document.getElementById('emailSlideIn');
  const backdrop = document.getElementById('emailBackdrop');
  if (!slide || !backdrop) return;
  // Load product image into modal
  const esiImg = document.getElementById('esiImg');
  if (esiImg && IMGS && IMGS['saffron_serum']) esiImg.src = IMGS['saffron_serum'];
  slide.style.display = 'block';
  backdrop.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeEmailSlide() {
  const slide = document.getElementById('emailSlideIn');
  const backdrop = document.getElementById('emailBackdrop');
  if (slide) slide.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
  document.body.style.overflow = '';
}

function submitEmailSlide() {
  const first = document.getElementById('esiFirst');
  const email = document.getElementById('esiEmail');
  if (!email || !email.value.includes('@')) {
    if (email) email.style.borderColor = '#C84040';
    return;
  }
  document.getElementById('esiForm').style.display = 'none';
  document.getElementById('esiConfirm').style.display = 'block';
  // Auto-close after 3s
  setTimeout(closeEmailSlide, 3000);
}

function loadMoreReviews() {
  alert('Connect your Okendo or Yotpo review app in Shopify to load paginated reviews.');
}


// ── SCROLL REVEAL ──
function initReveal() {
  setTimeout(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }});
    }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.reveal:not(.vis)').forEach(el => obs.observe(el));
  }, 100);
}

// ── HEADER SCROLL ──
window.addEventListener("scroll", function () {
    let scroll = window.scrollY;

    if (scroll >= 60) {
        document.getElementById("hdr").classList.add("fixed");
    } else {
        document.getElementById("hdr").classList.remove("fixed");
    }
});


// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  // Hero images
  si('h-main', 'saffron_serum');
  si('ss-product-img', 'saffron_serum');
  si('h-toner', 'rose_toner');
  si('h-baku', 'bakuchiol');
  initHomePageExtended();
  si('h-turmeric', 'turmeric');

  // Product grid
  si('p1', 'saffron_serum');
  si('p2', 'saffron_moist');
  si('p3', 'bakuchiol');
  si('p4', 'turmeric');
  si('p5', 'rose_toner');
  si('p6', 'rose_cleanser');

  // Founder + book
  si('f-img', 'founder_reading');
  si('bk-img', 'moss_book_new');

  // Ritual panel product images
  si('rv-am-1', 'rose_cleanser'); si('rv-am-2', 'rose_toner'); si('rv-am-3', 'saffron_serum');
  si('rv-pm-1', 'rose_cleanser'); si('rv-pm-2', 'bakuchiol'); si('rv-pm-3', 'saffron_moist');
  si('rv-wk-1', 'rose_cleanser'); si('rv-wk-2', 'turmeric'); si('rv-wk-3', 'saffron_serum');
  si('sig-abhyanga-1','rose_cleanser'); si('sig-abhyanga-2','turmeric'); si('sig-abhyanga-3','saffron_serum');

  // About page
  si('ab-hero',    'founder_reading');
  si('ab-moss',    'moss_logo');
  si('ab-founder2','founder2');

  // Spa page hero — use founder image
  si('sp-hero', 'founder3');

  // Also love
  si('al1', 'saffron_moist');
  si('al2', 'bakuchiol');
  si('al3', 'rose_toner');

  // concern grid images
  si('cc1','saffron_serum'); si('cc2','saffron_moist');
  si('cc3','bakuchiol');     si('cc4','turmeric');
  si('cc5','rose_toner');    si('cc6','rose_cleanser');

  initReveal();

  // Force-reveal items in default-active ritual tab (hidden by display:none blocks IntersectionObserver)
  var defaultTab = document.getElementById('t-am');
  if (defaultTab) {
    defaultTab.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('vis'); });
  }
});

// ── MOBILE NAV ──
function toggleMobileNav() {
  const menu = document.getElementById('mobileNavMenu');
  const hb1 = document.getElementById('hbLine1');
  const hb2 = document.getElementById('hbLine2');
  const hb3 = document.getElementById('hbLine3');
  const isOpen = menu.style.display === 'block';
  menu.style.display = isOpen ? 'none' : 'block';
  document.body.style.overflow = isOpen ? '' : 'hidden';
  if (!isOpen) {
    hb1.style.transform = 'rotate(45deg) translate(5px,5px)';
    hb2.style.opacity = '0';
    hb3.style.transform = 'rotate(-45deg) translate(4px,-4px)';
    hb3.style.width = '22px';
  } else {
    hb1.style.transform = ''; hb2.style.opacity = '1';
    hb3.style.transform = ''; hb3.style.width = '';
  }
}
function closeMobileNav() {
  const menu = document.getElementById('mobileNavMenu');
  menu.style.display = 'none';
  document.body.style.overflow = '';
  document.getElementById('hbLine1').style.transform = '';
  document.getElementById('hbLine2').style.opacity = '1';
  document.getElementById('hbLine3').style.transform = '';
  document.getElementById('hbLine3').style.width = '';
}
// Close mobile nav on page navigate
//const _origNav = nav;


// ═══════════════════════════════════════════════════════
// NEW HOMEPAGE JS — Quiz · Sticky ATC · Urgency · Init
// ═══════════════════════════════════════════════════════

// ── QUIZ STATE ──
var quizData = { q1: null, q2: null, q3: null };
var quizResults = {
  // key: skinType-timing-concern
  'dry-morning-glow':    { name:'TEJAS Morning Ritual', desc:'Saffron-rich hydration that restores radiance while you sleep. Best for dry skin craving luminosity.',products:['Saffron Glow Serum','Saffron Moisturizer'],price:'$168',save:'Save $18',sutra:1, link:"/pages/tejas" },
  'dry-night-aging':     { name:'CHIRAYU Night Ritual', desc:'Bakuchiol resurfaces and firms through the night. Saffron moisturizer seals in deep hydration until dawn.',products:['Bakuchiol Serum','Saffron Moisturizer'],price:'$138',save:'Save $28',sutra:3, link:"/pages/chirayu" },
  'dry-both-glow':       { name:'SWAPNA Full Ritual', desc:'Complete morning-to-night ritual for deeply nourished, glowing skin. Cleanser + Bakuchiol + Saffron Moisturizer.',products:['Rose Cleanser','Bakuchiol','Saffron Moisturizer'],price:'$174',save:'Save $30',sutra:5, link:"/pages/swapna" },
  'oily-morning-acne':   { name:'SHUDDHI Rose Ritual', desc:'Clarifying rose cleanser + toning mist balance oil and calm breakouts without stripping.',products:['Rose Cleanser','Rose Toning Mist'],price:'$67',save:'Save $13',sutra:0, link:"/pages/shuddhi" },
  'oily-weekly-acne':    { name:'ABHYANGA Spa Ritual', desc:'Weekly turmeric mask ceremony draws out impurities and brightens. Your Sunday reset.',products:['Rose Cleanser','Turmeric Mask','Saffron Serum'],price:'$168',save:'Save $26',sutra:6, link:"/pages/abhyanga" },
  'sensitive-morning-pigment': { name:'SHUDDHI Rose Ritual', desc:'Gentle botanical rose cleanser and calming toning mist — perfect for reactive skin.',products:['Rose Cleanser','Rose Toning Mist'],price:'$67',save:'Save $13',sutra:0, link:"/pages/shuddhi" },
  'normal-both-glow':    { name:'DINACHARYA Morning Ritual', desc:'Your complete Ayurvedic morning ritual. Cleanser, toner, and the Saffron Glow Serum.',products:['Rose Cleanser','Toning Mist','Saffron Serum'],price:'$158',save:'Save $20',sutra:4, link:"/pages/dinacharya" },
  'default':             { name:'DINACHARYA Morning Ritual', desc:'Your complete Ayurvedic morning ritual — the most popular starting point for new Prana customers.',products:['Rose Cleanser','Toning Mist','Saffron Serum'],price:'$158',save:'Save $20',sutra:4, link:"/pages/dinacharya" },
};

function quizAnswer(step, val) {
  // Highlight selected
  var step_el = document.getElementById('qStep' + step);
  if(step_el) {
    var opts = step_el.querySelectorAll('.hp-quiz-opt');
    opts.forEach(function(o){ o.classList.remove('selected'); });
    event.target.classList.add('selected');
  }
  quizData['q' + step] = val;
  setTimeout(function(){
    document.getElementById('qStep' + step).style.display = 'none';
    var next = step + 1;
    if(next <= 4) {
      document.getElementById('qStep' + next).style.display = 'block';
    } else {
      showQuizResult();
    }
  }, 320);
}

function showQuizResult() {
  var key = (quizData.q1||'normal') + '-' + (quizData.q2||'both') + '-' + (quizData.q3||'glow');
  var result = quizResults[key] || quizResults['default'];
  // Find closest match if exact not found
  if(!quizResults[key]) {
    var keys = Object.keys(quizResults);
    for(var i=0;i<keys.length;i++){
      var parts = keys[i].split('-');
      if(parts[0] === quizData.q1 || parts[1] === quizData.q2) {
        result = quizResults[keys[i]]; break;
      }
    }
  }

 
  document.getElementById('qStep4').style.display = 'none';
  document.getElementById('qResultName').textContent = result.name;
  document.getElementById('qResultDesc').textContent = result.desc;
  var productsHtml = result.products.map(function(p){
    return '<span class="hp-quiz-result-product-tag">' + p + '</span>';
  }).join('');
  document.getElementById('qResultProducts').innerHTML = productsHtml;
  document.getElementById('qResultPrice').textContent = result.price + '  ·  ' + result.save;
  var cta = document.getElementById('qResultCTA');
  cta.onclick = function(){ window.location.href = result.link; loadSutra(result.link); };
  document.getElementById('qResult').style.display = 'block';
}

function quizRestart() {
  quizData = { q1: null, q2: null, q3: null };
  ['qStep1','qStep2','qStep3'].forEach(function(id,i){
    var el = document.getElementById(id);
    if(el){ el.style.display = i===0 ? 'block' : 'none'; }
  });
  document.getElementById('qResult').style.display = 'none';
  document.getElementById('qEmailGate').style.display = 'none';
}


  var scrolled = false;
  window.addEventListener('scroll', function(){
    var bar = document.getElementById('stickyBar');
    if(!bar) return;
    var threshold = window.innerHeight * 1.1;
    if(window.scrollY > threshold && !scrolled) {
      scrolled = true;
      bar.style.display = 'block';
    } else if(window.scrollY <= threshold * 0.7) {
      scrolled = false;
      bar.style.display = 'none';
    }
  });


 window.addEventListener("load", function() {
  if (window.location.hash === "#qEmailGate") {
    document.getElementById('qStep1').style.display = 'none';
    showQuizResult();
  }
});



function stickyAddToCart() {
  addToCart(stickyCurrentProduct);
  var atc = document.getElementById('stickyATC');
  if(atc){ atc.textContent = '✓ Added'; atc.style.background='#2D6A2D'; setTimeout(function(){ atc.textContent='Add to Cart'; atc.style.background=''; },2000); }
}

// ── URGENCY SIGNALS ──
function initUrgencySignals() {
  var viewers = Math.floor(Math.random() * 40) + 80;
  var urgEl = document.getElementById('heroUrgency');
  if(urgEl) urgEl.innerHTML = '<strong>' + viewers + ' people</strong> viewing Prana right now · Ships within 24 hours';
  // Slowly increment/decrement
  setInterval(function(){
    viewers += Math.random() > 0.5 ? 1 : -1;
    viewers = Math.max(60, Math.min(140, viewers));
    if(urgEl) urgEl.innerHTML = '<strong>' + viewers + ' people</strong> viewing Prana right now · Ships within 24 hours';
  }, 8000);
}

// ── HERO MOBILE PRODUCT SYNC ──
function initHeroMobileProduct() {
  var mobileImg = document.getElementById('heroMobileProduct');
  var desktopImg = document.getElementById('h-main');
  if(mobileImg && desktopImg) {
    mobileImg.src = desktopImg.src;
    mobileImg.onload = function(){};
  }
}

// ── EMAIL CAPTURE ──
function submitEmailCapture(e) {
  if(e) e.preventDefault();
  var emailEl = document.getElementById('emailCaptureInput');
  var nameEl  = document.getElementById('emailCaptureFirst');
  if(!emailEl || !emailEl.value) return;
  var btn = document.getElementById('emailCaptureBtn');
  if(btn){ btn.textContent = 'Sending...'; btn.disabled = true; }
  setTimeout(function(){
    var form = document.getElementById('emailCaptureForm');
    if(form) form.innerHTML = '<div style="text-align:center;padding:24px 0"><div style="font-family:var(--U);font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin-bottom:12px">✓ You\'re In</div><div style="font-family:var(--D);font-size:28px;font-weight:300;color:var(--ink);margin-bottom:8px">Check your inbox.</div><div style="font-family:var(--S);font-size:14px;color:var(--ink3)">Your free Ritual Guide is on its way — along with your welcome gift.</div></div>';
  }, 900);
}

// ── HOMEPAGE INIT ──
function initHomePageExtended() {
  initUrgencySignals();
  setTimeout(initHeroMobileProduct, 300);
}

function toggleFaq(qEl) {
  var answer = qEl.nextElementSibling;
  var icon   = qEl.querySelector('.pdp-faq-icon');
  var isOpen = answer.classList.contains('open');
  document.querySelectorAll('.pdp-faq-a').forEach(function(a) { a.classList.remove('open'); });
  document.querySelectorAll('.pdp-faq-icon').forEach(function(ic) { ic.classList.remove('open'); });
  if (!isOpen) {
    answer.classList.add('open');
    icon.classList.add('open');
    answer.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
}

//var _ingData = _ingDataSaffron;

var _ingcOffset = 0;
function ingcScroll(dir) {
  var track = document.getElementById('ingcTrack');
  if (!track) return;
  var total = track.querySelectorAll('.ingc-card').length;
  var max = Math.max(0, total - 4);
  _ingcOffset = Math.max(0, Math.min(_ingcOffset + dir, max));
  var cardW = track.parentElement.offsetWidth / 4 + 4; // 4 visible + gap
  track.style.transform = 'translateX(-' + (_ingcOffset * cardW) + 'px)';
  // disable arrows at limits
  var prev = document.querySelector('.ingc-prev');
  var next = document.querySelector('.ingc-next');
  if (prev) prev.disabled = _ingcOffset === 0;
  if (next) next.disabled = _ingcOffset >= max;
}

 function ingcClose() {
   document.getElementById('ingcDetail').style.display = 'none';
   document.querySelectorAll('.ingc-card').forEach(function(c){ c.classList.remove('on'); });
 }


// ===================================================================

$(document).ready(function() {
  $(".main-menu").each(function() {
    const $menu = $(this);
    const $second = $menu.find(".sub-menu:nth-child(2)");
    const $third = $menu.find(".sub-menu:nth-child(3)");
    $second.append($third);
  });

  //  refresh cart drawer
  function update_cart_drawer(){
    import('@theme/events').then(({ CartUpdateEvent }) => {
      const cartDrawer = document.querySelector('cart-drawer-component');    
      fetch('/cart.js')
      .then(res => res.json())
      .then(cart => {
        const event = new CartUpdateEvent(cart, 'manual-trigger', {
          itemCount: cart.item_count,
          source: 'fad-refresh',
          sections: {}
        });
        document.dispatchEvent(event);
          cartDrawer.open();
      });
    });
  }

  // ATC product
  $('.pcaro-atc, .custom-atc, .complete-cart-button, .sutra-step-atc').click(function(e) {
    var selectedVariant = $(this).attr('pid');

    var success_btn = $(this).parents(".card-footer").find(".success-btn");
    var atc_btn = $(this).parents(".card-footer").find(".custom-atc");
    
    $.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: JSON.stringify({ id: selectedVariant, quantity: 1 }),
      dataType: 'json',
      contentType: 'application/json',
      success: function(data) {
        update_cart_drawer();
        $(".nav-cart-icon").trigger("click");
        $(success_btn).show();
        $(atc_btn).hide();
        setTimeout(function() {
          $(success_btn).hide();
          $(atc_btn).show();
        },500);
      },
      error: function(err) {
      }
    });
  });

  //Atc full collection
  $('.r3-add-bundle, .add-full-bundle, .rb-atc, .sutra-atc-btn').click(function() {
    var variants = [];

    $(this).closest('.r3-col').find('.pcaro-atc').each(function() {
      variants.push({
        id: $(this).attr('pid'),
        quantity: 1
      });
    });

    $(this).parents('.pdp-complete').find('.custom-atc').each(function() {
      variants.push({
        id: $(this).attr('pid'),
        quantity: 1
      });
    });

    $(this).parents('.ritual-section').find('.variant-id').each(function() {
      variants.push({
        id: $(this).val(),
        quantity: 1
      });
    });

    $(this).parents('.sutra-intro-aside').find('.sutra-aside-products .variant-id').each(function() {
      variants.push({
        id: $(this).val(),
        quantity: 1
      });
    });
    
    $.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: JSON.stringify({ items: variants }),
      dataType: 'json',
      contentType: 'application/json',
      success: function(data) {
        update_cart_drawer();
        $(".nav-cart-icon").trigger("click");
      },
      error: function(err) {
        console.log(err);
      }
    });
  });

  $(".pdp-acc-head").click(function(){
    $(this).parents(".pdp-acc-item").find(".pdp-acc-body").slideToggle();
  });
  
  $(".ingc-card").click(function() {
    $(this).toggleClass("on");
    $(this).siblings().removeClass("on");
    var index = $(this).index();
    var target = $(".ingc-detail-inner").eq(index);

    if (target.is(":visible")) {
      $(".ingc-detail").hide();
      target.hide();
    } else {
      $(".ingc-detail").show();
      $(".ingc-detail-inner").hide();
      target.show();
    }
  });

  $(".shop-tab").click(function() {
    $(this).toggleClass("on");
    $(this).siblings().removeClass("on");
    var index = $(this).index();
    $(".ritual-section, .sutra-detail").eq(index).show();
    $(".ritual-section, .sutra-detail").eq(index).siblings().hide();
  });


  var hash = window.location.hash.substring(1);
  $(".shop-tab").each(function(){
      var a = $(this).attr("id");
        if(a == hash){
          $(this).trigger("click");
        }
  });

  $(".sub-menu a").click(function(){
    setTimeout(function() {
      var hash = window.location.hash.substring(1);
      $(".shop-tab").each(function(){
        var a = $(this).attr("id");
          if(a == hash){
            $(this).trigger("click");
          }
      });
    }, 50);
  });

  $(".sutra-also-grid a").click(function(){
    var link = $(this).attr("href");
    window.location.reload(link); 
  });

  $('.product-image-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: false,
    asNavFor: '.product-thumnbail-slider'
  });
  $('.product-thumnbail-slider').slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    asNavFor: '.product-image-slider',
    dots: false,
    arrows: true,
    vertical: true,
    focusOnSelect: true,
    responsive: [
    {
      breakpoint: 767,
      settings: {
        vertical: false,
        slidesToShow: 4,
      }
    }
  ]
  });

  $(".save-price").each(function(){
    var price = $(this).text();
      let number = parseFloat(price.replace(/[^0-9.]/g, ''));
    let rounded = Math.round(number);
      $(this).text("$"+rounded);
  });

});
