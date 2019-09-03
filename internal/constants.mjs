// https://www.khronos.org/registry/webgl/specs/1.0/

/* ClearBufferMask */
export const DEPTH_BUFFER_BIT               = 0x00000100;
export const STENCIL_BUFFER_BIT             = 0x00000400;
export const COLOR_BUFFER_BIT               = 0x00004000;

/* BeginMode */
export const POINTS                         = 0x0000;
export const LINES                          = 0x0001;
export const LINE_LOOP                      = 0x0002;
export const LINE_STRIP                     = 0x0003;
export const TRIANGLES                      = 0x0004;
export const TRIANGLE_STRIP                 = 0x0005;
export const TRIANGLE_FAN                   = 0x0006;

/* BlendingFactorDest */
export const ZERO                           = 0;
export const ONE                            = 1;
export const SRC_COLOR                      = 0x0300;
export const ONE_MINUS_SRC_COLOR            = 0x0301;
export const SRC_ALPHA                      = 0x0302;
export const ONE_MINUS_SRC_ALPHA            = 0x0303;
export const DST_ALPHA                      = 0x0304;
export const ONE_MINUS_DST_ALPHA            = 0x0305;

/* BlendingFactorSrc */
export const DST_COLOR                      = 0x0306;
export const ONE_MINUS_DST_COLOR            = 0x0307;
export const SRC_ALPHA_SATURATE             = 0x0308;

/* BlendEquationSeparate */
export const FUNC_ADD                       = 0x8006;
export const BLEND_EQUATION                 = 0x8009;
export const BLEND_EQUATION_RGB             = 0x8009;   /* same as BLEND_EQUATION */
export const BLEND_EQUATION_ALPHA           = 0x883D;

/* BlendSubtract */
export const FUNC_SUBTRACT                  = 0x800A;
export const FUNC_REVERSE_SUBTRACT          = 0x800B;

/* Separate Blend Functions */
export const BLEND_DST_RGB                  = 0x80C8;
export const BLEND_SRC_RGB                  = 0x80C9;
export const BLEND_DST_ALPHA                = 0x80CA;
export const BLEND_SRC_ALPHA                = 0x80CB;
export const CONSTANT_COLOR                 = 0x8001;
export const ONE_MINUS_CONSTANT_COLOR       = 0x8002;
export const CONSTANT_ALPHA                 = 0x8003;
export const ONE_MINUS_CONSTANT_ALPHA       = 0x8004;
export const BLEND_COLOR                    = 0x8005;

/* Buffer Objects */
export const ARRAY_BUFFER                   = 0x8892;
export const ELEMENT_ARRAY_BUFFER           = 0x8893;
export const ARRAY_BUFFER_BINDING           = 0x8894;
export const ELEMENT_ARRAY_BUFFER_BINDING   = 0x8895;

export const STREAM_DRAW                    = 0x88E0;
export const STATIC_DRAW                    = 0x88E4;
export const DYNAMIC_DRAW                   = 0x88E8;

export const BUFFER_SIZE                    = 0x8764;
export const BUFFER_USAGE                   = 0x8765;

export const CURRENT_VERTEX_ATTRIB          = 0x8626;

/* CullFaceMode */
export const FRONT                          = 0x0404;
export const BACK                           = 0x0405;
export const FRONT_AND_BACK                 = 0x0408;

/* EnableCap */
/* TEXTURE_2D */
export const CULL_FACE                      = 0x0B44;
export const BLEND                          = 0x0BE2;
export const DITHER                         = 0x0BD0;
export const STENCIL_TEST                   = 0x0B90;
export const DEPTH_TEST                     = 0x0B71;
export const SCISSOR_TEST                   = 0x0C11;
export const POLYGON_OFFSET_FILL            = 0x8037;
export const SAMPLE_ALPHA_TO_COVERAGE       = 0x809E;
export const SAMPLE_COVERAGE                = 0x80A0;

/* ErrorCode */
export const NO_ERROR                       = 0;
export const INVALID_ENUM                   = 0x0500;
export const INVALID_VALUE                  = 0x0501;
export const INVALID_OPERATION              = 0x0502;
export const OUT_OF_MEMORY                  = 0x0505;

/* FrontFaceDirection */
export const CW                             = 0x0900;
export const CCW                            = 0x0901;

/* GetPName */
export const LINE_WIDTH                     = 0x0B21;
export const ALIASED_POINT_SIZE_RANGE       = 0x846D;
export const ALIASED_LINE_WIDTH_RANGE       = 0x846E;
export const CULL_FACE_MODE                 = 0x0B45;
export const FRONT_FACE                     = 0x0B46;
export const DEPTH_RANGE                    = 0x0B70;
export const DEPTH_WRITEMASK                = 0x0B72;
export const DEPTH_CLEAR_VALUE              = 0x0B73;
export const DEPTH_FUNC                     = 0x0B74;
export const STENCIL_CLEAR_VALUE            = 0x0B91;
export const STENCIL_FUNC                   = 0x0B92;
export const STENCIL_FAIL                   = 0x0B94;
export const STENCIL_PASS_DEPTH_FAIL        = 0x0B95;
export const STENCIL_PASS_DEPTH_PASS        = 0x0B96;
export const STENCIL_REF                    = 0x0B97;
export const STENCIL_VALUE_MASK             = 0x0B93;
export const STENCIL_WRITEMASK              = 0x0B98;
export const STENCIL_BACK_FUNC              = 0x8800;
export const STENCIL_BACK_FAIL              = 0x8801;
export const STENCIL_BACK_PASS_DEPTH_FAIL   = 0x8802;
export const STENCIL_BACK_PASS_DEPTH_PASS   = 0x8803;
export const STENCIL_BACK_REF               = 0x8CA3;
export const STENCIL_BACK_VALUE_MASK        = 0x8CA4;
export const STENCIL_BACK_WRITEMASK         = 0x8CA5;
export const VIEWPORT                       = 0x0BA2;
export const SCISSOR_BOX                    = 0x0C10;
/*      SCISSOR_TEST */
export const COLOR_CLEAR_VALUE              = 0x0C22;
export const COLOR_WRITEMASK                = 0x0C23;
export const UNPACK_ALIGNMENT               = 0x0CF5;
export const PACK_ALIGNMENT                 = 0x0D05;
export const MAX_TEXTURE_SIZE               = 0x0D33;
export const MAX_VIEWPORT_DIMS              = 0x0D3A;
export const SUBPIXEL_BITS                  = 0x0D50;
export const RED_BITS                       = 0x0D52;
export const GREEN_BITS                     = 0x0D53;
export const BLUE_BITS                      = 0x0D54;
export const ALPHA_BITS                     = 0x0D55;
export const DEPTH_BITS                     = 0x0D56;
export const STENCIL_BITS                   = 0x0D57;
export const POLYGON_OFFSET_UNITS           = 0x2A00;
/*      POLYGON_OFFSET_FILL */
export const POLYGON_OFFSET_FACTOR          = 0x8038;
export const TEXTURE_BINDING_2D             = 0x8069;
export const SAMPLE_BUFFERS                 = 0x80A8;
export const SAMPLES                        = 0x80A9;
export const SAMPLE_COVERAGE_VALUE          = 0x80AA;
export const SAMPLE_COVERAGE_INVERT         = 0x80AB;

export const COMPRESSED_TEXTURE_FORMATS     = 0x86A3;

/* HintMode */
export const DONT_CARE                      = 0x1100;
export const FASTEST                        = 0x1101;
export const NICEST                         = 0x1102;

/* HintTarget */
export const GENERATE_MIPMAP_HINT            = 0x8192;

/* DataType */
export const BYTE                           = 0x1400;
export const UNSIGNED_BYTE                  = 0x1401;
export const SHORT                          = 0x1402;
export const UNSIGNED_SHORT                 = 0x1403;
export const INT                            = 0x1404;
export const UNSIGNED_INT                   = 0x1405;
export const FLOAT                          = 0x1406;

/* PixelFormat */
export const DEPTH_COMPONENT                = 0x1902;
export const ALPHA                          = 0x1906;
export const RGB                            = 0x1907;
export const RGBA                           = 0x1908;
export const LUMINANCE                      = 0x1909;
export const LUMINANCE_ALPHA                = 0x190A;

/* PixelType */
/*      UNSIGNED_BYTE */
export const UNSIGNED_SHORT_4_4_4_4         = 0x8033;
export const UNSIGNED_SHORT_5_5_5_1         = 0x8034;
export const UNSIGNED_SHORT_5_6_5           = 0x8363;

/* Shaders */
export const FRAGMENT_SHADER                  = 0x8B30;
export const VERTEX_SHADER                    = 0x8B31;
export const MAX_VERTEX_ATTRIBS               = 0x8869;
export const MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB;
export const MAX_VARYING_VECTORS              = 0x8DFC;
export const MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
export const MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C;
export const MAX_TEXTURE_IMAGE_UNITS          = 0x8872;
export const MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD;
export const SHADER_TYPE                      = 0x8B4F;
export const DELETE_STATUS                    = 0x8B80;
export const LINK_STATUS                      = 0x8B82;
export const VALIDATE_STATUS                  = 0x8B83;
export const ATTACHED_SHADERS                 = 0x8B85;
export const ACTIVE_UNIFORMS                  = 0x8B86;
export const ACTIVE_ATTRIBUTES                = 0x8B89;
export const SHADING_LANGUAGE_VERSION         = 0x8B8C;
export const CURRENT_PROGRAM                  = 0x8B8D;

/* StencilFunction */
export const NEVER                          = 0x0200;
export const LESS                           = 0x0201;
export const EQUAL                          = 0x0202;
export const LEQUAL                         = 0x0203;
export const GREATER                        = 0x0204;
export const NOTEQUAL                       = 0x0205;
export const GEQUAL                         = 0x0206;
export const ALWAYS                         = 0x0207;

/* StencilOp */
export const KEEP                           = 0x1E00;
export const REPLACE                        = 0x1E01;
export const INCR                           = 0x1E02;
export const DECR                           = 0x1E03;
export const INVERT                         = 0x150A;
export const INCR_WRAP                      = 0x8507;
export const DECR_WRAP                      = 0x8508;

/* StringName */
export const VENDOR                         = 0x1F00;
export const RENDERER                       = 0x1F01;
export const VERSION                        = 0x1F02;

/* TextureMagFilter */
export const NEAREST                        = 0x2600;
export const LINEAR                         = 0x2601;

/* TextureMinFilter */
export const NEAREST_MIPMAP_NEAREST         = 0x2700;
export const LINEAR_MIPMAP_NEAREST          = 0x2701;
export const NEAREST_MIPMAP_LINEAR          = 0x2702;
export const LINEAR_MIPMAP_LINEAR           = 0x2703;

/* TextureParameterName */
export const TEXTURE_MAG_FILTER             = 0x2800;
export const TEXTURE_MIN_FILTER             = 0x2801;
export const TEXTURE_WRAP_S                 = 0x2802;
export const TEXTURE_WRAP_T                 = 0x2803;

/* TextureTarget */
export const TEXTURE_2D                     = 0x0DE1;
export const TEXTURE                        = 0x1702;

export const TEXTURE_CUBE_MAP               = 0x8513;
export const TEXTURE_BINDING_CUBE_MAP       = 0x8514;
export const TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
export const TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
export const TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
export const TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
export const TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
export const TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851A;
export const MAX_CUBE_MAP_TEXTURE_SIZE      = 0x851C;

/* TextureUnit */
export const TEXTURE0                       = 0x84C0;
export const TEXTURE1                       = 0x84C1;
export const TEXTURE2                       = 0x84C2;
export const TEXTURE3                       = 0x84C3;
export const TEXTURE4                       = 0x84C4;
export const TEXTURE5                       = 0x84C5;
export const TEXTURE6                       = 0x84C6;
export const TEXTURE7                       = 0x84C7;
export const TEXTURE8                       = 0x84C8;
export const TEXTURE9                       = 0x84C9;
export const TEXTURE10                      = 0x84CA;
export const TEXTURE11                      = 0x84CB;
export const TEXTURE12                      = 0x84CC;
export const TEXTURE13                      = 0x84CD;
export const TEXTURE14                      = 0x84CE;
export const TEXTURE15                      = 0x84CF;
export const TEXTURE16                      = 0x84D0;
export const TEXTURE17                      = 0x84D1;
export const TEXTURE18                      = 0x84D2;
export const TEXTURE19                      = 0x84D3;
export const TEXTURE20                      = 0x84D4;
export const TEXTURE21                      = 0x84D5;
export const TEXTURE22                      = 0x84D6;
export const TEXTURE23                      = 0x84D7;
export const TEXTURE24                      = 0x84D8;
export const TEXTURE25                      = 0x84D9;
export const TEXTURE26                      = 0x84DA;
export const TEXTURE27                      = 0x84DB;
export const TEXTURE28                      = 0x84DC;
export const TEXTURE29                      = 0x84DD;
export const TEXTURE30                      = 0x84DE;
export const TEXTURE31                      = 0x84DF;
export const ACTIVE_TEXTURE                 = 0x84E0;

/* TextureWrapMode */
export const REPEAT                         = 0x2901;
export const CLAMP_TO_EDGE                  = 0x812F;
export const MIRRORED_REPEAT                = 0x8370;

/* Uniform Types */
export const FLOAT_VEC2                     = 0x8B50;
export const FLOAT_VEC3                     = 0x8B51;
export const FLOAT_VEC4                     = 0x8B52;
export const INT_VEC2                       = 0x8B53;
export const INT_VEC3                       = 0x8B54;
export const INT_VEC4                       = 0x8B55;
export const BOOL                           = 0x8B56;
export const BOOL_VEC2                      = 0x8B57;
export const BOOL_VEC3                      = 0x8B58;
export const BOOL_VEC4                      = 0x8B59;
export const FLOAT_MAT2                     = 0x8B5A;
export const FLOAT_MAT3                     = 0x8B5B;
export const FLOAT_MAT4                     = 0x8B5C;
export const SAMPLER_2D                     = 0x8B5E;
export const SAMPLER_CUBE                   = 0x8B60;

/* Vertex Arrays */
export const VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622;
export const VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623;
export const VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624;
export const VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625;
export const VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A;
export const VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645;
export const VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

/* Read Format */
export const IMPLEMENTATION_COLOR_READ_TYPE   = 0x8B9A;
export const IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

/* Shader Source */
export const COMPILE_STATUS                 = 0x8B81;

/* Shader Precision-Specified Types */
export const LOW_FLOAT                      = 0x8DF0;
export const MEDIUM_FLOAT                   = 0x8DF1;
export const HIGH_FLOAT                     = 0x8DF2;
export const LOW_INT                        = 0x8DF3;
export const MEDIUM_INT                     = 0x8DF4;
export const HIGH_INT                       = 0x8DF5;

/* Framebuffer Object. */
export const FRAMEBUFFER                    = 0x8D40;
export const RENDERBUFFER                   = 0x8D41;

export const RGBA4                          = 0x8056;
export const RGB5_A1                        = 0x8057;
export const RGB565                         = 0x8D62;
export const DEPTH_COMPONENT16              = 0x81A5;
export const STENCIL_INDEX                  = 0x1901;
export const STENCIL_INDEX8                 = 0x8D48;
export const DEPTH_STENCIL                  = 0x84F9;

export const RENDERBUFFER_WIDTH             = 0x8D42;
export const RENDERBUFFER_HEIGHT            = 0x8D43;
export const RENDERBUFFER_INTERNAL_FORMAT   = 0x8D44;
export const RENDERBUFFER_RED_SIZE          = 0x8D50;
export const RENDERBUFFER_GREEN_SIZE        = 0x8D51;
export const RENDERBUFFER_BLUE_SIZE         = 0x8D52;
export const RENDERBUFFER_ALPHA_SIZE        = 0x8D53;
export const RENDERBUFFER_DEPTH_SIZE        = 0x8D54;
export const RENDERBUFFER_STENCIL_SIZE      = 0x8D55;

export const FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0;
export const FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1;
export const FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2;
export const FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

export const COLOR_ATTACHMENT0              = 0x8CE0;
export const DEPTH_ATTACHMENT               = 0x8D00;
export const STENCIL_ATTACHMENT             = 0x8D20;
export const DEPTH_STENCIL_ATTACHMENT       = 0x821A;

export const NONE                           = 0;

export const FRAMEBUFFER_COMPLETE                      = 0x8CD5;
export const FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6;
export const FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
export const FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9;
export const FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD;

export const FRAMEBUFFER_BINDING            = 0x8CA6;
export const RENDERBUFFER_BINDING           = 0x8CA7;
export const MAX_RENDERBUFFER_SIZE          = 0x84E8;

export const INVALID_FRAMEBUFFER_OPERATION  = 0x0506;

/* WebGL-specific enums */
export const UNPACK_FLIP_Y_WEBGL            = 0x9240;
export const UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
export const CONTEXT_LOST_WEBGL             = 0x9242;
export const UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
export const BROWSER_DEFAULT_WEBGL          = 0x9244;